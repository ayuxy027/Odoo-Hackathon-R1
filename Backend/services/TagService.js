const db = require('../config/database');
const logger = require('../utils/logger');

class TagService {
  // Get all tags with usage statistics
  static getAllTags(options = {}) {
    try {
      const { 
        limit = 50, 
        offset = 0, 
        sortBy = 'usage_count', 
        sortOrder = 'DESC',
        search = null 
      } = options;

      logger.logDBOperation('SELECT', 'tags', { options });

      let query = `
        SELECT 
          t.id,
          t.name,
          t.description,
          t.usage_count,
          t.created_at,
          (SELECT COUNT(*) FROM question_tags qt WHERE qt.tag_id = t.id) as question_count
        FROM tags t
      `;

      const params = [];
      const conditions = [];

      // Add search filter
      if (search) {
        conditions.push('(t.name LIKE ? OR t.description LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
      }

      // Add WHERE clause if conditions exist
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      // Add sorting
      const allowedSortFields = ['name', 'usage_count', 'created_at'];
      const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'usage_count';
      const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      
      query += ` ORDER BY t.${safeSortBy} ${safeSortOrder}`;
      
      // Add pagination
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const tags = db.prepare(query).all(...params);

      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as count FROM tags t';
      const countParams = [];
      
      if (conditions.length > 0) {
        countQuery += ' WHERE ' + conditions.join(' AND ');
        countParams.push(...params.slice(0, -2));
      }

      const totalCount = db.prepare(countQuery).get(...countParams).count;

      return {
        success: true,
        tags,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      };
    } catch (error) {
      logger.error('Error fetching tags:', error);
      throw new Error('Failed to fetch tags');
    }
  }

  // Get tag by ID with detailed information
  static getTagById(tagId) {
    try {
      logger.logDBOperation('SELECT', 'tags', { tagId });

      const tag = db.prepare(`
        SELECT 
          t.id,
          t.name,
          t.description,
          t.usage_count,
          t.created_at,
          (SELECT COUNT(*) FROM question_tags qt WHERE qt.tag_id = t.id) as question_count
        FROM tags t
        WHERE t.id = ?
      `).get(tagId);

      if (!tag) {
        return {
          success: false,
          message: 'Tag not found'
        };
      }

      return {
        success: true,
        tag
      };
    } catch (error) {
      logger.error('Error fetching tag by ID:', error);
      throw new Error('Failed to fetch tag');
    }
  }

  // Get tag by name
  static getTagByName(tagName) {
    try {
      logger.logDBOperation('SELECT', 'tags', { tagName });

      const tag = db.prepare(`
        SELECT 
          t.id,
          t.name,
          t.description,
          t.usage_count,
          t.created_at,
          (SELECT COUNT(*) FROM question_tags qt WHERE qt.tag_id = t.id) as question_count
        FROM tags t
        WHERE LOWER(t.name) = LOWER(?)
      `).get(tagName);

      if (!tag) {
        return {
          success: false,
          message: 'Tag not found'
        };
      }

      return {
        success: true,
        tag
      };
    } catch (error) {
      logger.error('Error fetching tag by name:', error);
      throw new Error('Failed to fetch tag');
    }
  }

  // Create new tag
  static createTag(tagData) {
    try {
      const { name, description = '' } = tagData;
      const cleanName = name.trim().toLowerCase();

      logger.logDBOperation('INSERT', 'tags', { name: cleanName });

      // Check if tag already exists
      const existingTag = db.prepare('SELECT id FROM tags WHERE LOWER(name) = LOWER(?)').get(cleanName);
      if (existingTag) {
        return {
          success: false,
          message: 'Tag already exists'
        };
      }

      // Insert new tag
      const stmt = db.prepare('INSERT INTO tags (name, description) VALUES (?, ?)');
      const result = stmt.run(cleanName, description);

      return {
        success: true,
        message: 'Tag created successfully',
        tagId: result.lastInsertRowid
      };
    } catch (error) {
      logger.error('Error creating tag:', error);
      throw new Error('Failed to create tag');
    }
  }

  // Update tag
  static updateTag(tagId, tagData) {
    try {
      const { name, description } = tagData;
      
      logger.logDBOperation('UPDATE', 'tags', { tagId });

      // Check if tag exists
      const existingTag = db.prepare('SELECT id FROM tags WHERE id = ?').get(tagId);
      if (!existingTag) {
        return {
          success: false,
          message: 'Tag not found'
        };
      }

      // Check if new name conflicts with existing tag
      if (name) {
        const cleanName = name.trim().toLowerCase();
        const conflictingTag = db.prepare('SELECT id FROM tags WHERE LOWER(name) = LOWER(?) AND id != ?')
          .get(cleanName, tagId);
        
        if (conflictingTag) {
          return {
            success: false,
            message: 'Tag name already exists'
          };
        }
      }

      // Update tag
      const updates = [];
      const params = [];
      
      if (name) {
        updates.push('name = ?');
        params.push(name.trim().toLowerCase());
      }
      
      if (description !== undefined) {
        updates.push('description = ?');
        params.push(description);
      }

      if (updates.length === 0) {
        return {
          success: false,
          message: 'No updates provided'
        };
      }

      params.push(tagId);
      const stmt = db.prepare(`UPDATE tags SET ${updates.join(', ')} WHERE id = ?`);
      stmt.run(...params);

      return {
        success: true,
        message: 'Tag updated successfully'
      };
    } catch (error) {
      logger.error('Error updating tag:', error);
      throw new Error('Failed to update tag');
    }
  }

  // Delete tag (admin only)
  static deleteTag(tagId) {
    try {
      logger.logDBOperation('DELETE', 'tags', { tagId });

      // Check if tag exists
      const tag = db.prepare('SELECT id, usage_count FROM tags WHERE id = ?').get(tagId);
      if (!tag) {
        return {
          success: false,
          message: 'Tag not found'
        };
      }

      // Check if tag is in use
      const questionsUsingTag = db.prepare('SELECT COUNT(*) as count FROM question_tags WHERE tag_id = ?')
        .get(tagId).count;

      if (questionsUsingTag > 0) {
        return {
          success: false,
          message: `Cannot delete tag. It is currently used by ${questionsUsingTag} question(s)`
        };
      }

      // Delete tag
      const stmt = db.prepare('DELETE FROM tags WHERE id = ?');
      stmt.run(tagId);

      return {
        success: true,
        message: 'Tag deleted successfully'
      };
    } catch (error) {
      logger.error('Error deleting tag:', error);
      throw new Error('Failed to delete tag');
    }
  }

  // Get popular tags (most used)
  static getPopularTags(limit = 20) {
    try {
      logger.logDBOperation('SELECT', 'tags', { limit });

      const tags = db.prepare(`
        SELECT 
          t.id,
          t.name,
          t.description,
          t.usage_count,
          (SELECT COUNT(*) FROM question_tags qt WHERE qt.tag_id = t.id) as question_count
        FROM tags t
        WHERE t.usage_count > 0
        ORDER BY t.usage_count DESC
        LIMIT ?
      `).all(limit);

      return {
        success: true,
        tags
      };
    } catch (error) {
      logger.error('Error fetching popular tags:', error);
      throw new Error('Failed to fetch popular tags');
    }
  }

  // Get recent tags
  static getRecentTags(limit = 20) {
    try {
      logger.logDBOperation('SELECT', 'tags', { limit });

      const tags = db.prepare(`
        SELECT 
          t.id,
          t.name,
          t.description,
          t.usage_count,
          t.created_at,
          (SELECT COUNT(*) FROM question_tags qt WHERE qt.tag_id = t.id) as question_count
        FROM tags t
        ORDER BY t.created_at DESC
        LIMIT ?
      `).all(limit);

      return {
        success: true,
        tags
      };
    } catch (error) {
      logger.error('Error fetching recent tags:', error);
      throw new Error('Failed to fetch recent tags');
    }
  }

  // Search tags by name
  static searchTags(searchTerm, limit = 10) {
    try {
      logger.logDBOperation('SELECT', 'tags', { searchTerm, limit });

      const tags = db.prepare(`
        SELECT 
          t.id,
          t.name,
          t.description,
          t.usage_count,
          (SELECT COUNT(*) FROM question_tags qt WHERE qt.tag_id = t.id) as question_count
        FROM tags t
        WHERE t.name LIKE ? OR t.description LIKE ?
        ORDER BY t.usage_count DESC
        LIMIT ?
      `).all(`%${searchTerm}%`, `%${searchTerm}%`, limit);

      return {
        success: true,
        tags
      };
    } catch (error) {
      logger.error('Error searching tags:', error);
      throw new Error('Failed to search tags');
    }
  }

  // Get questions for a specific tag
  static getQuestionsByTag(tagId, options = {}) {
    try {
      const { limit = 10, offset = 0 } = options;
      
      logger.logDBOperation('SELECT', 'questions', { tagId, options });

      const questions = db.prepare(`
        SELECT 
          q.id,
          q.title,
          q.description,
          q.votes,
          q.view_count,
          q.created_at,
          q.accepted_answer_id,
          u.username as author,
          (SELECT COUNT(*) FROM answers WHERE question_id = q.id) as answer_count
        FROM questions q
        JOIN users u ON q.user_id = u.id
        JOIN question_tags qt ON q.id = qt.question_id
        WHERE qt.tag_id = ?
        ORDER BY q.created_at DESC
        LIMIT ? OFFSET ?
      `).all(tagId, limit, offset);

      const totalCount = db.prepare(`
        SELECT COUNT(*) as count 
        FROM questions q
        JOIN question_tags qt ON q.id = qt.question_id
        WHERE qt.tag_id = ?
      `).get(tagId).count;

      return {
        success: true,
        questions,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      };
    } catch (error) {
      logger.error('Error fetching questions by tag:', error);
      throw new Error('Failed to fetch questions by tag');
    }
  }

  // Get tag statistics
  static getTagStatistics() {
    try {
      logger.logDBOperation('SELECT', 'tags', {});

      const stats = db.prepare(`
        SELECT 
          COUNT(*) as total_tags,
          COUNT(CASE WHEN usage_count > 0 THEN 1 END) as used_tags,
          COUNT(CASE WHEN usage_count = 0 THEN 1 END) as unused_tags,
          AVG(usage_count) as avg_usage,
          MAX(usage_count) as max_usage,
          MIN(usage_count) as min_usage
        FROM tags
      `).get();

      return {
        success: true,
        stats
      };
    } catch (error) {
      logger.error('Error fetching tag statistics:', error);
      throw new Error('Failed to fetch tag statistics');
    }
  }

  // Clean up unused tags (admin utility)
  static cleanupUnusedTags() {
    try {
      logger.logDBOperation('DELETE', 'tags', {});

      // Delete tags that have no questions associated and usage_count = 0
      const stmt = db.prepare(`
        DELETE FROM tags 
        WHERE id NOT IN (
          SELECT DISTINCT tag_id FROM question_tags
        ) AND usage_count = 0
      `);
      
      const result = stmt.run();

      return {
        success: true,
        message: `Cleaned up ${result.changes} unused tags`
      };
    } catch (error) {
      logger.error('Error cleaning up unused tags:', error);
      throw new Error('Failed to cleanup unused tags');
    }
  }
}

module.exports = TagService; 
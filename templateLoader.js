// templateLoader.js - 动态加载评分模板

class TemplateLoader {
  constructor() {
    this.template = null;
    this.templatePath = 'rating_template.json';
  }

  // 加载JSON模板
  async loadTemplate() {
    try {
      const response = await fetch(chrome.runtime.getURL(this.templatePath));
      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.status}`);
      }
      this.template = await response.json();
      console.log('Template loaded successfully:', this.template);
      return this.template;
    } catch (error) {
      console.error('Error loading template:', error);
      // 如果加载失败，使用默认模板
      return this.getDefaultTemplate();
    }
  }

  // 获取默认模板（作为备用）
  getDefaultTemplate() {
    return {
      template_id: "sentinel_default",
      template_name: "Sentinel Default Template",
      template_version: "1.0.0",
      rating_dimensions: {
        "left_right_economics": {
          "name": "Left/Right Economics",
          "max": 10,
          "min": 1,
          "category": "political",
          "description": {
            "1": "Far left (e.g., communist)",
            "10": "Far right (e.g., extreme market liberal)"
          }
        },
        "authoritarian_libertarian_culture": {
          "name": "Authoritarian/Libertarian Culture",
          "max": 10,
          "min": 1,
          "category": "political",
          "description": {
            "1": "Far left",
            "10": "Far right"
          }
        }
        // 其他默认维度...
      }
    };
  }

  // 验证模板格式
  validateTemplate(template) {
    const requiredFields = ['template_id', 'template_name', 'rating_dimensions'];
    for (const field of requiredFields) {
      if (!template[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    if (typeof template.rating_dimensions !== 'object') {
      throw new Error('rating_dimensions must be an object');
    }
    
    return true;
  }

  // 生成评分HTML
  generateRatingHTML(template) {
    if (!template || !template.rating_dimensions) {
      console.error('Invalid template for HTML generation');
      return '';
    }

    let html = '';
    
    // 按类别分组
    const categories = this.groupByCategory(template.rating_dimensions);
    
    for (const [category, dimensions] of Object.entries(categories)) {
      html += `<div class="rating-category">
        <h3 class="category-title">${this.getCategoryDisplayName(category)}</h3>`;
      
      for (const [dimensionId, dimension] of Object.entries(dimensions)) {
        html += this.generateDimensionHTML(dimensionId, dimension);
      }
      
      html += '</div>';
    }
    
    return html;
  }

  // 按类别分组维度
  groupByCategory(dimensions) {
    const categories = {};
    
    for (const [id, dimension] of Object.entries(dimensions)) {
      const category = dimension.category || 'general';
      if (!categories[category]) {
        categories[category] = {};
      }
      categories[category][id] = dimension;
    }
    
    return categories;
  }

  // 获取类别显示名称
  getCategoryDisplayName(category) {
    const categoryNames = {
      'political': 'Political & Economic Ratings',
      'content': 'Content Ratings',
      'discrimination': 'Discrimination Ratings',
      'quality': 'Quality Ratings',
      'service': 'Service & Experience Ratings',
      'general': 'General Ratings'
    };
    
    return categoryNames[category] || 'Other Ratings';
  }

  // 生成单个维度的HTML
  generateDimensionHTML(dimensionId, dimension) {
    const { name, max, min = 1, description } = dimension;
    
    let html = `
      <div class="rating-item">
        <label>${name} (${min}-${max}):</label>
        <div class="score-bar-container" data-max="${max}" data-name="${dimensionId}">
          <div class="score-bar-bg"></div>
          <div class="score-bar-fg"></div>
          <div class="score-ticks"></div>
          <input type="hidden" name="${dimensionId}" value="0">
        </div>
        <div class="rating-desc">`;
    
    // 添加描述
    if (description) {
      const keys = Object.keys(description).sort((a, b) => parseInt(a) - parseInt(b));
      if (keys.length >= 2) {
        html += `<span>${keys[0]}: ${description[keys[0]]}</span>`;
        html += `<span>${keys[keys.length - 1]}: ${description[keys[keys.length - 1]]}</span>`;
      }
    }
    
    html += `
        </div>
      </div>`;
    
    return html;
  }

  // 获取模板元数据
  getTemplateMetadata() {
    if (!this.template) return null;
    
    return {
      id: this.template.template_id,
      name: this.template.template_name,
      version: this.template.template_version,
      description: this.template.description,
      dimensionCount: Object.keys(this.template.rating_dimensions).length,
      categories: this.getCategories()
    };
  }

  // 获取所有类别
  getCategories() {
    if (!this.template) return [];
    
    const categories = new Set();
    for (const dimension of Object.values(this.template.rating_dimensions)) {
      categories.add(dimension.category || 'general');
    }
    
    return Array.from(categories);
  }

  // 获取特定维度的配置
  getDimensionConfig(dimensionId) {
    if (!this.template || !this.template.rating_dimensions) {
      return null;
    }
    
    return this.template.rating_dimensions[dimensionId] || null;
  }

  // 计算加权评分
  calculateWeightedScore(ratings) {
    if (!this.template) return null;
    
    let totalWeight = 0;
    let weightedSum = 0;
    
    for (const [dimensionId, rating] of Object.entries(ratings)) {
      const config = this.getDimensionConfig(dimensionId);
      if (config && config.weight && rating > 0) {
        const normalizedRating = rating / config.max;
        weightedSum += normalizedRating * config.weight;
        totalWeight += config.weight;
      }
    }
    
    if (totalWeight === 0) return null;
    
    return {
      weightedAverage: weightedSum / totalWeight,
      totalWeight: totalWeight,
      dimensionCount: Object.keys(ratings).length
    };
  }
}

// 导出模板加载器
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TemplateLoader;
} else {
  window.TemplateLoader = TemplateLoader;
}

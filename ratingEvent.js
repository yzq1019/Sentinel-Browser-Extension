// src/ratingEvent.js

// Sentinel评分模板常量
export const SENTINEL_TEMPLATES = {
  ECONOMICS: 'economics',
  AUTHORITARIANISM: 'authoritarianism', 
  SEXUAL_CONTENT: 'sexual_content',
  SELF_HARM: 'self_harm',
  VIOLENCE: 'violence',
  RACISM: 'racism',
  QUALITY: 'quality'
};

// Nostr事件类型
const SENTINEL_KIND = 30015;

export class RatingEvent {
  constructor(pubkey, resourceURI, template, scores, comment = '') {
    this.pubkey = pubkey;
    this.resourceURI = resourceURI;
    this.template = template;
    this.scores = scores;
    this.comment = comment;
    this.created_at = Math.floor(Date.now() / 1000);
  }

  // 转换为Nostr事件格式
  toNostrEvent() {
    return {
      kind: SENTINEL_KIND,
      pubkey: this.pubkey,
      created_at: this.created_at,
      tags: [
        ['r', this.resourceURI], // 资源URI
        ['t', this.template],    // 评分模板
      ],
      content: JSON.stringify({
        scores: this.scores,
        comment: this.comment,
        template: this.template
      })
    };
  }

  // 从Nostr事件解析
  static fromNostrEvent(event) {
    try {
      const content = JSON.parse(event.content);
      const resourceURI = event.tags.find(tag => tag[0] === 'r')?.[1];
      const template = event.tags.find(tag => tag[0] === 't')?.[1];
      
      return new RatingEvent(
        event.pubkey,
        resourceURI,
        template,
        content.scores || {},
        content.comment || ''
      );
    } catch (error) {
      console.error('解析Nostr事件失败:', error);
      return null;
    }
  }

  // 验证事件格式
  static isValid(event) {
    return event.kind === SENTINEL_KIND &&
           event.tags.some(tag => tag[0] === 'r') &&
           event.tags.some(tag => tag[0] === 't');
  }
}


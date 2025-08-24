document.addEventListener('DOMContentLoaded', function() {
  console.log('popup.js loaded');
  
  // 初始化模板加载器
  const templateLoader = new TemplateLoader();
  let currentTemplate = null;
  
  // 页面加载时初始化模板
  initializeTemplate();
  
  async function initializeTemplate() {
    try {
      console.log('Loading rating template...');
      currentTemplate = await templateLoader.loadTemplate();
      
      if (currentTemplate) {
        // 显示模板信息
        displayTemplateInfo(currentTemplate);
        
        // 生成动态评分界面
        const dynamicContainer = document.getElementById('dynamic-rating-container');
        const staticContainer = document.getElementById('static-rating-container');
        
        if (dynamicContainer && staticContainer) {
          const ratingHTML = templateLoader.generateRatingHTML(currentTemplate);
          dynamicContainer.innerHTML = ratingHTML;
          
          // 隐藏静态容器
          staticContainer.style.display = 'none';
          
          // 重新初始化评分条
          initializeScoreBars();
          
          console.log('Dynamic template loaded successfully');
        }
      } else {
        console.log('Using static rating template');
        showStaticTemplate();
      }
    } catch (error) {
      console.error('Failed to load template:', error);
      showStaticTemplate();
    }
  }
  
  function displayTemplateInfo(template) {
    const templateInfo = document.getElementById('template-info');
    const templateName = document.getElementById('template-name');
    const templateDescription = document.getElementById('template-description');
    const templateVersion = document.getElementById('template-version');
    const templateDimensions = document.getElementById('template-dimensions');
    
    if (templateInfo && templateName && templateDescription && templateVersion && templateDimensions) {
      templateName.textContent = template.template_name || 'Unknown';
      templateDescription.textContent = template.description || '';
      templateVersion.textContent = template.template_version || '1.0.0';
      templateDimensions.textContent = Object.keys(template.rating_dimensions || {}).length;
      
      templateInfo.style.display = 'block';
    }
  }
  
  function showStaticTemplate() {
    const dynamicContainer = document.getElementById('dynamic-rating-container');
    const staticContainer = document.getElementById('static-rating-container');
    
    if (dynamicContainer && staticContainer) {
      dynamicContainer.innerHTML = '';
      staticContainer.style.display = 'block';
      initializeScoreBars();
    }
  }
  
  function initializeScoreBars() {
    // 重新初始化所有评分条
    document.querySelectorAll('.score-bar-container').forEach(bar => {
      const max = parseInt(bar.dataset.max, 10);
      const name = bar.dataset.name;
      let value = 0;
      const barBg = bar.querySelector('.score-bar-bg');
      const barFg = bar.querySelector('.score-bar-fg');
      const ticksContainer = bar.querySelector('.score-ticks');
      const hidden = bar.querySelector('input[type=hidden]');
      
      // 清空现有的ticks
      ticksContainer.innerHTML = '';
      
      // 创建新的ticks
      for (let i = 0; i < max; i++) {
        const tick = document.createElement('div');
        tick.className = 'score-tick';
        tick.style.left = (i / (max - 1) * 100) + '%';
        tick.title = (i + 1);
        ticksContainer.appendChild(tick);
        tick.addEventListener('click', e => {
          value = i + 1;
          updateBar();
          e.stopPropagation();
        });

        const label = document.createElement('div');
        label.className = 'score-label';
        label.textContent = i + 1;
        label.style.left = (i / (max - 1) * 100) + '%';
        ticksContainer.appendChild(label);
      }
      
      // 点击横线选分
      barBg.addEventListener('click', e => {
        const rect = barBg.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = x / rect.width;
        value = Math.round(percent * (max - 1)) + 1;
        updateBar();
      });
      
      function updateBar() {
        if (value === 0) {
          barFg.style.width = '0%';
          hidden.value = 0;
          const ticks = bar.querySelectorAll('.score-tick');
          const labels = bar.querySelectorAll('.score-label');
          ticks.forEach(tick => tick.classList.remove('selected'));
          labels.forEach(label => label.classList.remove('selected'));
        } else {
          barFg.style.width = ((value - 1) / (max - 1) * 100) + '%';
          hidden.value = value;
          const ticks = bar.querySelectorAll('.score-tick');
          const labels = bar.querySelectorAll('.score-label');
          ticks.forEach((tick, idx) => {
            tick.classList.toggle('selected', idx < value);
          });
          labels.forEach((label, idx) => {
            label.classList.toggle('selected', idx + 1 === value);
          });
        }
      }
      
      updateBar();
    });
  }
  
  // 其他现有代码保持不变...
  const stars = document.querySelectorAll('.star');
  const currentUrlDiv = document.querySelector('.current-url');
  
  // Get current tab URL
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentUrl = tabs[0].url;
    let displayUrl = currentUrl;
    try {
      const urlObj = new URL(currentUrl);
      displayUrl = urlObj.hostname;
    } catch (e) {
      displayUrl = currentUrl;
    }
    currentUrlDiv.textContent = displayUrl;
    
    // Load existing rating for this URL
    chrome.storage.local.get(currentUrl, function(data) {
      const rating = data[currentUrl] || 0;
      console.log('Loaded rating for', currentUrl, ':', rating);
      updateStars(rating);
    });
  });

  // Add click event listeners to stars
  stars.forEach(star => {
    star.addEventListener('click', function() {
      const rating = parseInt(this.getAttribute('data-rating'));
      const currentUrl = currentUrlDiv.textContent;
      console.log('Star clicked:', rating, 'for', currentUrl);
      // Save rating
      chrome.storage.local.set({[currentUrl]: rating}, function() {
        updateStars(rating);
      });
    });

    star.addEventListener('mouseover', function() {
      const rating = parseInt(this.getAttribute('data-rating'));
      console.log('Star mouseover:', rating);
      updateStars(rating);
    });

    star.addEventListener('mouseout', function() {
      const currentUrl = currentUrlDiv.textContent;
      chrome.storage.local.get(currentUrl, function(data) {
        const rating = data[currentUrl] || 0;
        console.log('Star mouseout, restore rating:', rating);
        updateStars(rating);
      });
    });
  });

  function updateStars(rating) {
    console.log('updateStars called with rating:', rating);
    stars.forEach(star => {
      star.classList.remove('active');
    });
    if (rating > 0) {
      stars.forEach(star => {
        const starRating = parseInt(star.getAttribute('data-rating'));
        if (starRating <= rating) {
          star.classList.add('active');
        }
      });
    }
  }
}); 
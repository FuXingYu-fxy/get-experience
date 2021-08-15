class DocumentHandler {
  constructor() {
    this.result = [];
    this.url = 'https://www.nowcoder.com/discuss/';
    this.document = null;
    this.div = null;
    this.count = 0;
    this.postId = 0;
  }
  getExperienceFromDocument() {
    if (this.document === null) {
      return;
    }
    let div = document.createElement('div');
    div.innerHTML = this.document;
    let result = [];
    let container = div.querySelector('.post-topic-des');
    this.parseHtml(container, result);
    
    this.result.push(result);
    this.document = null;
  }

  parseHtml(node, result) {
    if (node.tagName !== 'DIV' || node.firstElementChild === null || node.firstElementChild.tagName !== 'DIV') {
      let text = this.parseText(node);
      if (text !== '') {
        result.push(text);
      }
      return;
    }
    Array.from(node.children).forEach(child => {
      this.parseHtml(child, result);
    })
  }

  parseText(node) {
    return node.textContent
      .split('\n')
      .filter(item => !!item)
      .map(item => item.trim())
      .join('');
  }

  async getDocumentAsync(postId) {
    if (typeof postId === 'undefined') {
      return Promise.reject('postId为空');
    }
    this.postId = postId;
    const response = await fetch(this.url + postId);
    const data = await response.text();
    return this.document = data;
  }

  printExperience() {
    if (this.count >= this.result.length) {
      console.log('已经是最后一页了...');
      return;
    }
    let experience = this.result[this.count++];
    console.group(`%c第${this.count}篇: postId:${this.postId}`, 'color: #2dade7')
    experience.forEach(item => console.log(`%c${item}`, 'background: green; font-size: 20px'));
    console.groupEnd(`%c第${this.count}篇: postId:${this.postId}`);
  }
}


class PostIdHandler {
  /**
   * 除了companyId字段，其他都是筛选条件, 不填按默认条件查询
   * @param {object} options 可选配置项
   * @param {number} options.tagId 职业id，默认是前端工程师是 644
   * @param {number} options.companyId 按公司筛选，自己上牛客网查公司id 
   * @param {number} options.phaseId 面试类型筛选 1-校招 2-实习 3-社招
   * @param {number} options.order 排序依据，1-按热度降序排序, 2-按发帖时间降序排序
   */
  constructor({ tagId = 644, companyId = 0, phaseId = 0, order = 0 } = {}) {
    this.tagId = tagId;
    this.companyId = companyId;
    this.phaseId = phaseId;
    this.order = order;

    // 下一步获取的页数
    this.nextPage = 1;
    // 帖子总数量
    this.totalCnt = 0;
    // 分页的总数量
    this.totalPage = 0;
    // 每页有多少条帖子, 一般是30条
    this.pageSize = 0;
    // 帖子id
    this.postIdList = [];
    this.reload();
  }

  /**
     * 除了companyId字段，其他都是筛选条件, 不填按默认条件查询
     * @param {object} options 可选配置项
     * @param {number} options.tagId 职业id，默认是前端工程师是 644
     * @param {number} options.companyId 按公司筛选，自己上牛客网查公司id 
     * @param {number} options.phaseId 面试类型筛选 1-校招 2-实习 3-社招
     * @param {number} options.order 排序依据，1-按热度降序排序, 2-按发帖时间降序排序
     */
  async fetchPostId({ tagId = 644, companyId = 0, phaseId = 0, order = 0 } = {}) {
    const url = `https://www.nowcoder.com/discuss/experience/json?token=&tagId=${tagId}&companyId=${companyId}&phaseId=${phaseId}&order=${order}&query=&page=${this.nextPage}&_=${Date.now()}`;

    const response = await fetch(url);
    const { data } = await response.json();
    ({ totalCnt: this.totalCnt, totalPage: this.totalPage, pageSize: this.pageSize } = data);
    data.discussPosts.forEach(item => {
      this.postIdList.push(item.postId);
    });
    this.nextPage++;
  }

  /**
   * 如果不指定 amount 或者数量超过最大页数，则默认获取所有
   * 前端工程师面经一共有3000条, 每次请求后会暂停2s再下一次请求
   * @param {number} amount 
   */
  fetchSpecifiedPages(amount = this.totalPage) {
    if (amount === 0) {
      return;
    }
    amount = amount > this.totalPage ? this.totalPage : amount;
    for (let i = this.nextPage; i <= amount; i++) {
      this.fetchPostId({ nextPage: i });
      this.sleep();
    }
  }

  sleep(n = 2000) {
    let start = new Date().getTime();
    while (true) {
      if (new Date().getTime() - start > n) {
        console.log('技能cd中...');
        break;
      }
    }
  }

  getPostIdList() {
    return this.postIdList;
  }

  save() {
    let postIdHandlerInfo = {
      nextPage: this.nextPage,
      totalCnt: this.totalCnt,
      totalPage: this.totalPage,
      pageSize: this.pageSize,
      postIdList: this.postIdList,
    }
    localStorage.setItem('PostIdHandlerInfo', JSON.stringify(postIdHandlerInfo));
    console.log(localStorage.getItem('PostIdHandlerInfo'));
  }

  showDetailMessages() {
    console.group('统计如下:')
    console.log(`%c每页有： ${this.pageSize}条贴子`, 'color: #2dade7');
    console.log(`%c下一页: ${this.nextPage}`, 'color: #2dade7');
    console.log(`%c总页数: ${this.totalCnt}`, 'color: #2dade7');
  }

  reload() {
    let postIdHandlerInfo;
    if (!(postIdHandlerInfo = localStorage.getItem('PostIdHandlerInfo'))) {
      return;
    }
    console.log('reload');
    ({ nextPage: this.nextPage, totalCnt: this.totalCnt, totalPage: this.totalPage, pageSize: this.pageSize, postIdList: this.postIdList } = JSON.parse(postIdHandlerInfo));
  }

}

class Composed {
  constructor() {
    this.post = new PostIdHandler();
    this.document = new DocumentHandler();
    this.currentIndex = 0;
    this.postIdList = [];
  }
  async init() {
    this.postIdList = this.post.getPostIdList();
    if (this.postIdList.length !== 0) {
      console.log('初始化完成!!!');
      return true;
    }

    try {
      await this.post.fetchPostId();
      this.postIdList = this.post.getPostIdList();
      console.log('初始化完成!!!');
      return true;
    } catch (error) {
      return error;
    }
  }

  async load() {
    try {
      await this.post.fetchPostId();
      this.postIdList = this.post.getPostIdList();
      return true;
    } catch (error) {
      return error;
    }
  }

  async next() {
    if (this.postIdList.length === 0) {
      return Promise.reject('请调用init()初始化');
    }
    if (this.currentIndex >= this.postIdList.length) {
      // 30条看完了，再获取30条
      await this.load();
    }
    try {
      await this.document.getDocumentAsync(this.postIdList[this.currentIndex++]);
      this.document.getExperienceFromDocument();
      this.document.printExperience();
    } catch (error) {
      console.log(error);
    }
  }

  save() {
    this.post.save();
  }

}

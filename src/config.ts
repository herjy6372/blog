export const SITE = {
  github: 'https://github.com/herjy6372',
  portfolio: 'https://herjy6372.github.io/portfolio/',
  /**
   * Giscus 댓글 설정. https://giscus.app 에서 값을 발급받아 채우면 글 아래에 댓글이 나타납니다.
   * 비워 두면 댓글 영역은 표시되지 않습니다. (발급 방법은 README 참고)
   */
  giscus: {
    repo: '', // 예: 'herjy6372/blog'
    repoId: '',
    category: 'Comments',
    categoryId: '',
  },
};

export const giscusEnabled = Boolean(SITE.giscus.repo && SITE.giscus.repoId && SITE.giscus.categoryId);

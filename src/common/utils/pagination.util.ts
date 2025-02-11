export const pagingResponse = (
    items: any[],
    total: number,
    page: number,
    limit: number,
    url: string,
  ) => {
    const pageUrl = new URL(url);
    const totalPages = Math.ceil(total / limit);
  
    let next;
    if (totalPages > page) {
      next = page + 1;
    }
  
    let previous;
    if (page > 1) {
      previous = page - 1;
    }
  
    const paging = {
      total_items: total,
      page_size: limit,
      current: page,
      count: items.length || 0,
      next,
      previous,
    };
  
    const links = [];
  
    if (previous) {
      const prevUrl = new URL(pageUrl.toString());
      prevUrl.searchParams.set('page', previous.toString());
      links.push({
        href: prevUrl.href,
        rel: 'prev',
        method: 'GET',
      });
    }
  
    const currentUrl = new URL(pageUrl.toString());
    currentUrl.searchParams.set('page', page.toString());
    links.push({
      href: currentUrl.href,
      rel: 'current',
      method: 'GET',
    });
  
    if (next) {
      const nextUrl = new URL(pageUrl.toString());
      nextUrl.searchParams.set('page', next.toString());
      links.push({
        href: nextUrl.href,
        rel: 'next',
        method: 'GET',
      });
    }
  
    return {
      payload: items,
      paging,
      links,
    };
  };
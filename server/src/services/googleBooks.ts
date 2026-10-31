export interface GoogleBookItem {
  id: string;
  title: string;
  author: string;
  description: string;
  pageCount: number;
  coverImage: string;
  publishedDate?: string;
  isbn?: string;
}

export async function searchGoogleBooks(query: string): Promise<GoogleBookItem[]> {
  if (!query || query.trim().length === 0) return [];

  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=6`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Books API responded with status ${response.status}`);
    }

    const data: any = await response.json();
    if (!data.items || !Array.isArray(data.items)) {
      return [];
    }

    return data.items.map((item: any) => {
      const info = item.volumeInfo || {};
      const imageLinks = info.imageLinks || {};
      let coverImage = imageLinks.thumbnail || imageLinks.smallThumbnail || '';
      // Ensure https
      if (coverImage.startsWith('http://')) {
        coverImage = coverImage.replace('http://', 'https://');
      }
      if (!coverImage) {
        coverImage = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80';
      }

      const isbn13 = info.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier;
      const isbn10 = info.industryIdentifiers?.find((id: any) => id.type === 'ISBN_10')?.identifier;

      return {
        id: item.id,
        title: info.title || '',
        author: Array.isArray(info.authors) ? info.authors.join('، ') : (info.authors || 'مؤلف غير معروف'),
        description: info.description || '',
        pageCount: info.pageCount || 200,
        coverImage,
        publishedDate: info.publishedDate || '',
        isbn: isbn13 || isbn10 || '',
      };
    });
  } catch (error) {
    console.error('Google Books API search error:', error);
    return [];
  }
}

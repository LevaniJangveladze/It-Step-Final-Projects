export interface SearchParams {
    page_index: number,
    page_size: number,
    keywords: string,
    brand: string,
    category_id: string,
    rating: string,
    price_min: string | number,
    price_max: string | number,
    sort_by: string,
    sort_direction: string,
}

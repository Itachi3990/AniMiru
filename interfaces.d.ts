export interface quickSearchItem {
    ID: number;
    post_ep: string;
    post_genres: string;
    post_image: string;
    post_image_html: string;
    post_latest: string;
    post_link: string;
    post_sub: string;
    post_title: string;
    post_type: string;
}

export interface animeCardInfo {
    animeTitle: string;
    animeLink: string;
    animeImage: string;
}

export type PasswordStatus = 'ok' | 'Wrong Password' | 'Password Expired';
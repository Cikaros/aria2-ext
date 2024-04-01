export type AddSubscription = {
    title: string;
    link: string;
    description: string;
    path: string;
}

export type Subscription = {
    id: number;
    created_at: number;
    updated_at: number;
    title: string;
    link: string;
    description: string;
    plugin_by: string;
    limit: string;
    path: string;
    enable: boolean;
}

export type AddFile = {
    reference: number;
    guid: string;
    is_perma_link: boolean;
    link: string;
    title: string;
    description: string;
    torrent_link: string;
    torrent_content_length: number;
    torrent_pub_date: string;
    enclosure_type: string;
    enclosure_length: number;
    enclosure_url: string;
    aria_id: string;
}

export type File = {
    id: number;
    created_at: number;
    updated_at: number;
    reference: number;
    guid: string;
    is_perma_link: boolean;
    link: string;
    title: string;
    description: string;
    torrent_link: string;
    torrent_content_length: number;
    torrent_pub_date: string;
    enclosure_type: string;
    enclosure_length: number;
    enclosure_url: string;
    aria_id: string;
}
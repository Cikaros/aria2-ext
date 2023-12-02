// @generated automatically by Diesel CLI.

diesel::table! {
    files (id) {
        id -> Nullable<Integer>,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        reference -> Integer,
        guid -> Text,
        is_perma_link -> Bool,
        link -> Text,
        title -> Text,
        description -> Text,
        torrent_link -> Nullable<Text>,
        torrent_content_length -> Nullable<Integer>,
        torrent_pub_date -> Nullable<Text>,
        enclosure_type -> Nullable<Text>,
        enclosure_length -> Nullable<Integer>,
        enclosure_url -> Nullable<Text>,
        aria_id -> Text,
    }
}

diesel::table! {
    subscriptions (id) {
        id -> Integer,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        title -> Text,
        link -> Text,
        description -> Text,
        plugin_by -> Text,
        limit -> Text,
        path -> Text,
        enable -> Bool,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    files,
    subscriptions,
);

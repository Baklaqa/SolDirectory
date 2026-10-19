<?php
if (!defined('ABSPATH')) exit;

/**
 * Pages the content automation writes (apps/api: services/pageContent, deploy/N8N_SUBURB_REWRITE_PROMPT.md).
 *
 * The API (Mongo) holds the facts and decides whether a rewrite is good enough to go live; WordPress holds a copy of each page as a post so
 * editors can read it, search it and unpublish it. The API writes these posts through the REST API with an application password, so the
 * meta below has to be registered as REST-writable, or WordPress silently drops it.
 *
 *   service_area_page   /services/{service}/{state}/{suburb}        (existing post type)
 *   register_area_page  /ndis-providers/{state}[/{suburb}] and /aged-care-providers/...   (new, never publicly routed: the React app serves the page)
 *   site_article        the authored pages and articles (guides, funding, condition and language topics, legal pages, blog, glossary), copied
 *                      from the site with the same HTML a crawler sees (apps/api services/wpMirror). New, never publicly routed.
 */

add_action('init', function () {
    register_post_type('register_area_page', [
        'labels' => ['name' => 'Register Area Pages', 'singular_name' => 'Register Area Page'],
        'public' => true,
        'show_in_rest' => true,
        'rest_base' => 'register-area-pages',
        'supports' => ['title', 'editor', 'excerpt'],
        'has_archive' => false,
        // The public page is served by the React app / SEO shell straight from the API, so this post type must not get its own URL.
        'publicly_queryable' => false,
        'show_in_menu' => true,
        'menu_icon' => 'dashicons-location-alt',
    ]);

    register_post_type('site_article', [
        'labels' => ['name' => 'Site Articles', 'singular_name' => 'Site Article'],
        'public' => true,
        'show_in_rest' => true,
        'rest_base' => 'site-articles',
        'supports' => ['title', 'editor'],
        'has_archive' => false,
        'publicly_queryable' => false,
        'show_in_menu' => true,
        'menu_icon' => 'dashicons-media-document',
    ]);

    $string_meta = [
        'sd_kind', 'sd_title_tag', 'sd_canonical', 'sd_robots', 'sd_jsonld_json', 'sd_hash',
        'sd_page_key',            // e.g. service:plan-management:vic:preston
        'sd_path',                // e.g. /services/plan-management/vic/preston
        'sd_status',              // approved | rejected | stale | unpublished | baseline
        'sd_seo_title',
        'sd_seo_description',
        'sd_intro',
        'sd_sections_json',
        'sd_faqs_json',
        'sd_facts_json',
        'sd_score_breakdown_json',
        'sd_approved_at',
    ];
    foreach (['service_area_page', 'register_area_page', 'site_article'] as $post_type) {
        foreach ($string_meta as $name) {
            register_post_meta($post_type, $name, [
                'show_in_rest' => true,
                'single' => true,
                'type' => 'string',
                'auth_callback' => fn() => current_user_can('edit_posts'),
            ]);
        }
        register_post_meta($post_type, 'sd_score', [
            'show_in_rest' => true,
            'single' => true,
            'type' => 'number',
            'auth_callback' => fn() => current_user_can('edit_posts'),
        ]);
    }
});

// An unapproved page must never be indexed even if someone publishes the post by hand. The meta is read by the Node API / SEO shell.
add_filter('rest_prepare_service_area_page', 'soldirectory_page_automation_flags', 10, 2);
add_filter('rest_prepare_register_area_page', 'soldirectory_page_automation_flags', 10, 2);
function soldirectory_page_automation_flags($response, $post) {
    $data = $response->get_data();
    $data['sd_indexable'] = get_post_meta($post->ID, 'sd_status', true) === 'approved';
    $response->set_data($data);
    return $response;
}

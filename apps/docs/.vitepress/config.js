import { defineConfig } from 'vitepress'
// import { markdownConfig } from 'vitepress-doc-plugin'

export default defineConfig({
    title: 'min-vue',
    description: 'vue3.0源码解析',
    lastUpdated: true,
    head: [['meta', { name: 'keywords', content: 'VUE, VUE3, HTML, CSS, JavaScript, VUE3源码解析' }]],
    themeConfig: {
        nav: [
            { text: '首页', link: '/', activeMatch: '' },
            { text: '文档', link: '/guide/introduction', activeMatch: '/guide/introduction' }
            // {
            //     text: '下拉选择框',
            //     items: [
            //         { text: 'options-1', link: '/' },
            //         { text: 'options-2', link: 'http://www.baidu.com' }
            //     ]
            // }
        ],
        socialLinks: [{ icon: 'github', link: 'https://github.com/xie392/min-vue' }],
        sidebar: [
            {
                text: '介绍',
                link: '/guide/introduction'
            },
            {
                text: '一、reactivity 响应式原理',
                items: [
                    { text: 'reactive', link: '/guide/reactive' },
                    { text: 'effect', link: '/guide/effect' }
                ],
                collapsible: true,
                collapsed: false
            }
        ],
        docFooter: { prev: '上一篇', next: '下一篇' },
        editLink: {
            pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
            text: 'Edit this page on GitHub'
        },
        lastUpdatedText: '最近更新时间',
        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2013-present xie392'
        }
    },
    outDir: '../dist',
    // markdown: {
    //     config: markdownConfig
    // }
})

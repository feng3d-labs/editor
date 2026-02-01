import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { resolve } from 'node:path';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import vue from '@vitejs/plugin-vue';
import vueDevtools from 'vite-plugin-vue-devtools';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

// 复制 Iconify JSON 文件到 public 目录的插件
function copyIconifyJsonFiles() {
    return {
        name: 'copy-iconify-json',
        buildStart() {
            // 在构建开始时复制需要的 JSON 文件到 public 目录
            const iconSets = ['mdi', 'material-symbols'];
            const publicDir = resolve(process.cwd(), 'public/iconify');
            
            if (!existsSync(publicDir)) {
                mkdirSync(publicDir, { recursive: true });
            }

            for (const iconSet of iconSets) {
                const srcPath = resolve(process.cwd(), `node_modules/@iconify/json/json/${iconSet}.json`);
                const destPath = resolve(publicDir, `${iconSet}.json`);
                
                if (existsSync(srcPath)) {
                    try {
                        copyFileSync(srcPath, destPath);
                        console.log(`[Vite] 已复制图标集: ${iconSet}.json`);
                    } catch (error) {
                        console.warn(`[Vite] 复制图标集失败 ${iconSet}:`, error.message);
                    }
                }
            }
        }
    };
}

// 复制静态资源的插件
function copyStaticAssets()
{
    return {
        name: 'copy-static-assets',
        async writeBundle()
        {
            // 使用 Node.js 内置模块（vite.config.js 在 Node.js 环境运行）
            const { resolve, dirname } = await import('node:path');
            const { existsSync, mkdirSync, copyFileSync, readdirSync, statSync } = await import('node:fs');
            const { fileURLToPath } = await import('node:url');
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = dirname(__filename);

            // 递归复制目录的函数
            const copyDir = (src, dest) =>
            {
                if (!existsSync(src)) return;
                if (!existsSync(dest)) mkdirSync(dest, { recursive: true });

                const entries = readdirSync(src, { withFileTypes: true });
                for (const entry of entries)
                {
                    const srcPath = resolve(src, entry.name);
                    const destPath = resolve(dest, entry.name);

                    if (entry.isDirectory())
                    {
                        copyDir(srcPath, destPath);
                    }
                    else
                    {
                        copyFileSync(srcPath, destPath);
                    }
                }
            };

            const outDir = resolve(__dirname, 'dist-vite');
            const assetsToCopy = [
                { from: 'libs', to: 'libs' },
                { from: 'packages', to: 'packages' },
                { from: 'node_modules/feng3d/dist', to: 'node_modules/feng3d/dist' },
                { from: 'node_modules/@feng3d-plugins/cannon/dist', to: 'node_modules/@feng3d-plugins/cannon/dist' },
                { from: 'node_modules/@feng3d-plugins/cannon-plugin/dist', to: 'node_modules/@feng3d-plugins/cannon-plugin/dist' },
                { from: 'dist/index.js', to: 'dist/index.js' },
                { from: 'run.js', to: 'run.js' }
            ];

            for (const { from, to } of assetsToCopy)
            {
                const srcPath = resolve(__dirname, from);
                const destPath = resolve(outDir, to);

                if (existsSync(srcPath))
                {
                    try
                    {
                        const stat = statSync(srcPath);
                        if (stat.isDirectory())
                        {
                            copyDir(srcPath, destPath);
                        }
                        else
                        {
                            const destDir = dirname(destPath);
                            if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
                            copyFileSync(srcPath, destPath);
                        }
                        console.log(`已复制: ${from} -> ${to}`);
                    }
                    catch (error)
                    {
                        console.warn(`复制失败 ${from}:`, error.message);
                    }
                }
            }
        }
    };
}

export default defineConfig(({ mode }) =>
{
    const isProduction = mode === 'production';

    return {
        // 开发服务器配置
        server: {
            port: 3000,
            open: false,
            cors: true,
            fs: {
                // 允许访问项目根目录外的文件
                allow: ['..']
            },
            // 配置代理，使 @iconify/json 的 JSON 文件可以通过 HTTP 访问
            middlewareMode: false
        },

        // 构建配置 - 多页面应用
        build: {
            outDir: 'dist-vite',
            emptyOutDir: true,
            sourcemap: !isProduction,
            minify: isProduction ? 'esbuild' : false,
            rollupOptions: {
                // 多页面入口配置
            input: {
                index: fileURLToPath(new URL('./index.html', import.meta.url)),
                run: fileURLToPath(new URL('./run.html', import.meta.url))
            },
                output: {
                    // 保持目录结构
                    entryFileNames: 'assets/[name]-[hash].js',
                    chunkFileNames: 'assets/[name]-[hash].js',
                    assetFileNames: 'assets/[name]-[hash].[ext]'
                },
                // 外部化处理：不打包这些依赖
                external: (id) =>
                    // 外部化 libs、node_modules、packages、dist 下的文件
                    id.startsWith('./libs/')
                    || id.startsWith('../libs/')
                    || id.startsWith('./node_modules/')
                    || id.startsWith('../node_modules/')
                    || id.startsWith('./packages/')
                    || id.startsWith('../packages/')
                    || id.startsWith('./dist/')
                    || id.startsWith('../dist/')
                    || id === './run.js'
                    || id === '../run.js'
            }
        },

        // 插件配置
        plugins: [
            vue(),
            vueDevtools({
                enabled: true,
            }),
            // Element Plus 按需引入
            AutoImport({
                resolvers: [ElementPlusResolver()],
            }),
            Components({
                resolvers: [ElementPlusResolver()],
            }),
            copyIconifyJsonFiles(), // 复制 Iconify JSON 文件
            copyStaticAssets()
        ],

        // 解析配置
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        },

        // 优化配置
        optimizeDeps: {
            // 排除不需要预构建的依赖
            // feng3d 是已构建的库，不需要预构建，避免类名被修改
            exclude: [
                'feng3d',
                '@feng3d-plugins/cannon',
                '@feng3d-plugins/cannon-plugin'
            ],
            // 包含需要预构建的 CommonJS 模块
            include: [
                'js-beautify'
            ],
            // 保持类名不被修改
            esbuildOptions: {
                keepNames: true
            }
        }
    };
});


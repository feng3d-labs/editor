import { defineConfig } from 'vite';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { copySync } from 'fs-extra';

// 复制静态资源的插件
function copyStaticAssets()
{
    return {
        name: 'copy-static-assets',
        async writeBundle()
        {
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
                        copySync(srcPath, destPath, { overwrite: true });
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
            }
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
                    index: resolve(__dirname, 'index.html'),
                    run: resolve(__dirname, 'run.html')
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
            copyStaticAssets()
        ],

        // 解析配置
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src')
            }
        },

        // 优化配置
        optimizeDeps: {
            // 排除不需要预构建的依赖
            exclude: []
        }
    };
});


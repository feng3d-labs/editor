import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { resolve } from 'node:path';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
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

// 配置 Cursor 编辑器的插件
function configureCursorEditor()
{
    return {
        name: 'configure-cursor-editor',
        configureServer(server)
        {
            // 设置环境变量，确保使用 Cursor
            process.env.LAUNCH_EDITOR = 'cursor';
            
            // 拦截 Vue DevTools 的编辑器打开请求
            // 支持多种可能的路径格式
            const editorPaths = ['/__open-in-editor', '/__vue-devtools__/open-in-editor'];
            
            editorPaths.forEach(path =>
            {
                server.middlewares.use(path, (req, res, next) =>
                {
                    // 解析 URL 参数
                    const url = new URL(req.url || '', `http://${req.headers.host}`);
                    const file = url.searchParams.get('file');
                    
                    // 调试：输出所有查询参数
                    console.log('[Vite] Vue DevTools 请求参数:', Object.fromEntries(url.searchParams));
                    
                    if (file)
                    {
                        try
                        {
                            // 解码文件路径
                            let filePath = decodeURIComponent(file);
                            
                            // 处理文件路径
                            // 如果是相对路径（不以 / 或 Windows 盘符开头），转换为绝对路径
                            if (!filePath.startsWith('/') && !filePath.match(/^[A-Za-z]:/))
                            {
                                filePath = resolve(process.cwd(), filePath);
                            }
                            // 如果是 Unix 风格的绝对路径（以 / 开头），在 Windows 上需要转换为 Windows 路径
                            else if (filePath.startsWith('/') && process.platform === 'win32')
                            {
                                // 如果路径是 /src/... 这样的格式，转换为项目根目录下的路径
                                if (!filePath.match(/^[A-Za-z]:/))
                                {
                                    filePath = resolve(process.cwd(), filePath.replace(/^\//, ''));
                                }
                            }
                            
                            // 使用 Cursor 在当前窗口中打开文件
                            // --reuse-window: 在现有窗口中打开文件（而不是打开新窗口）
                            // --goto: 跳转到指定行号和列号位置
                            // 尝试多种可能的参数名
                            const line = url.searchParams.get('line') || url.searchParams.get('lineNumber') || url.searchParams.get('l');
                            const column = url.searchParams.get('column') || url.searchParams.get('columnNumber') || url.searchParams.get('c');
                            const args = ['--reuse-window'];
                            
                            // 始终使用 --goto 参数，即使没有行号也可以打开文件
                            // 格式: --goto file:line:character 或 --goto file
                            let position = filePath;
                            if (line && line.trim() !== '')
                            {
                                // 如果有行号，添加行号和列号
                                position = column && column.trim() !== '' 
                                    ? `${filePath}:${line}:${column}` 
                                    : `${filePath}:${line}`;
                            }
                            
                            args.push('--goto', position);
                            console.log(`[Vite] 执行命令: cursor ${args.join(' ')}`);
                            
                            // 在 Windows 上，shell: true 可以确保正确执行命令
                            const child = spawn('cursor', args, { 
                                stdio: 'inherit', 
                                shell: true,
                                detached: true
                            });
                            
                            // 监听错误事件
                            child.on('error', (error) =>
                            {
                                console.error('[Vite] 执行 Cursor 命令失败:', error);
                            });
                            
                            // 不等待子进程，立即返回
                            child.unref();
                            
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'text/plain');
                            res.end('OK');
                        }
                        catch (error)
                        {
                            console.error('[Vite] 使用 Cursor 打开文件失败:', error);
                            res.statusCode = 500;
                            res.setHeader('Content-Type', 'text/plain');
                            res.end(`Failed to open file: ${error.message}`);
                        }
                    }
                    else
                    {
                        next();
                    }
                });
            });
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
            configureCursorEditor(), // 配置 Cursor 编辑器
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


/**
 * 发布前脚本
 * 将建源代码到 dist 目录
 */
const { execSync } = require('child_process');
const fs = require('fs');

// 检查是否存在 dist 目录，如果不存在则创建
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// 运行构建命令
try {
  console.log('Building package...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build completed successfully.');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
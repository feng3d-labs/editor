/**
 * 发布后脚本
 * 清理构建产物
 */
const { execSync } = require('child_process');
const fs = require('fs');

// 删除 dist 目录
try {
  if (fs.existsSync('dist')) {
    execSync('npx rimraf dist', { stdio: 'inherit' });
    console.log('Dist directory cleaned up.');
  }
} catch (error) {
  console.error('Cleanup failed:', error.message);
  // 不退出，因为这不影响发布
}
import { exec } from 'child_process';
import { promisify } from 'util';
import { readdir, stat } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m',
};

async function getFileSize(filePath) {
  const stats = await stat(filePath);
  return Math.round(stats.size / (1024 * 1024)); // MB
}

async function findVideoFiles(dir, files = []) {
  const items = await readdir(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stats = await stat(fullPath);

    if (stats.isDirectory()) {
      await findVideoFiles(fullPath, files);
    } else if (item.endsWith('.mp4')) {
      files.push(fullPath);
    }
  }

  return files;
}

async function compressVideo(inputPath, targetSizeMB = 50) {
  const sizeMB = await getFileSize(inputPath);
  const fileName = basename(inputPath);

  if (sizeMB <= targetSizeMB) {
    console.log(`${colors.green}✓ ${fileName} (${sizeMB}MB) - OK${colors.reset}`);
    return true;
  }

  console.log(`${colors.yellow}🗜️  Comprimindo: ${fileName} (${sizeMB}MB)${colors.reset}`);

  const tempPath = inputPath.replace('.mp4', '_compressed.mp4');

  try {
    // Primeira tentativa: CRF 32, 720p max, 1Mbps
    let command = `ffmpeg -i "${inputPath}" \
      -c:v libx264 \
      -crf 32 \
      -preset faster \
      -vf "scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease" \
      -maxrate 1M \
      -bufsize 2M \
      -c:a aac \
      -b:a 96k \
      -movflags +faststart \
      -y \
      "${tempPath}"`;

    await execPromise(command);
    let newSize = await getFileSize(tempPath);

    // Se ainda estiver grande, tenta compressão mais agressiva
    if (newSize > targetSizeMB) {
      console.log(`${colors.yellow}⚠️  Ainda muito grande (${newSize}MB), tentando mais...${colors.reset}`);

      command = `ffmpeg -i "${inputPath}" \
        -c:v libx264 \
        -crf 35 \
        -preset faster \
        -vf "scale='min(960,iw)':'min(540,ih)':force_original_aspect_ratio=decrease" \
        -maxrate 800k \
        -bufsize 1600k \
        -c:a aac \
        -b:a 64k \
        -movflags +faststart \
        -y \
        "${tempPath}"`;

      await execPromise(command);
      newSize = await getFileSize(tempPath);
    }

    // Substituir o arquivo original
    await execPromise(`move /Y "${tempPath}" "${inputPath}"`, { shell: 'cmd.exe' });

    console.log(`${colors.green}✅ ${fileName}: ${sizeMB}MB → ${newSize}MB${colors.reset}\n`);
    return true;

  } catch (error) {
    console.error(`${colors.red}❌ Erro ao comprimir ${fileName}: ${error.message}${colors.reset}\n`);
    // Remover arquivo temporário se existir
    try {
      await execPromise(`del "${tempPath}"`, { shell: 'cmd.exe' });
    } catch {}
    return false;
  }
}

async function main() {
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}🗜️  Compressor de Vídeos para Vercel${colors.reset}`);
  console.log(`${colors.yellow}Target: <50MB por arquivo${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  // Verificar FFmpeg
  try {
    await execPromise('ffmpeg -version');
  } catch {
    console.error(`${colors.red}❌ FFmpeg não encontrado!${colors.reset}`);
    console.log(`\n${colors.yellow}Instale o FFmpeg primeiro:${colors.reset}`);
    console.log(`   Windows: ${colors.blue}choco install ffmpeg${colors.reset}\n`);
    process.exit(1);
  }

  const videosDir = join(__dirname, 'public', 'videos');
  console.log(`${colors.yellow}📂 Procurando vídeos em: ${videosDir}${colors.reset}\n`);

  const videoFiles = await findVideoFiles(videosDir);

  if (videoFiles.length === 0) {
    console.log(`${colors.yellow}⚠️  Nenhum arquivo .mp4 encontrado${colors.reset}`);
    return;
  }

  console.log(`${colors.green}✨ Encontrados ${videoFiles.length} vídeo(s)${colors.reset}\n`);

  let processed = 0;
  let failed = 0;

  for (const videoPath of videoFiles) {
    const success = await compressVideo(videoPath);
    if (success) processed++;
    else failed++;
  }

  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}✅ Processados: ${processed}${colors.reset}`);
  if (failed > 0) {
    console.log(`${colors.red}❌ Falhas: ${failed}${colors.reset}`);
  }
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  console.log(`${colors.yellow}📝 Próximos passos:${colors.reset}`);
  console.log(`   1. ${colors.blue}git add public/videos/*.mp4${colors.reset}`);
  console.log(`   2. ${colors.blue}git commit -m "Compress videos for Vercel deployment"${colors.reset}`);
  console.log(`   3. ${colors.blue}git push${colors.reset}\n`);
}

main().catch(console.error);

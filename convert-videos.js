import { exec } from 'child_process';
import { promisify } from 'util';
import { readdir, stat } from 'fs/promises';
import { join, extname, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m',
};

async function findVideoFiles(dir, files = []) {
  const items = await readdir(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stats = await stat(fullPath);

    if (stats.isDirectory()) {
      await findVideoFiles(fullPath, files);
    } else {
      const ext = extname(item).toLowerCase();
      if (ext === '.mov') {
        files.push(fullPath);
      }
    }
  }

  return files;
}

async function convertVideo(inputPath) {
  const outputPath = inputPath.replace(/\.mov$/i, '.mp4');
  const fileName = basename(inputPath);

  console.log(`${colors.blue}🔄 Convertendo: ${fileName}${colors.reset}`);

  try {
    // FFmpeg command otimizado para web e mobile
    // -crf 28: qualidade boa com tamanho reduzido (23 é padrão, 28 é mais comprimido)
    // -preset fast: velocidade de encoding
    // -movflags +faststart: otimiza para streaming
    // -vf scale: redimensiona se necessário mantendo aspect ratio
    const command = `ffmpeg -i "${inputPath}" \
      -c:v libx264 \
      -crf 28 \
      -preset fast \
      -c:a aac \
      -b:a 128k \
      -movflags +faststart \
      -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease" \
      "${outputPath}"`;

    await execPromise(command);
    console.log(`${colors.green}✅ Sucesso: ${fileName} → ${basename(outputPath)}${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}❌ Erro ao converter ${fileName}: ${error.message}${colors.reset}`);
    return false;
  }
}

async function checkFFmpeg() {
  try {
    await execPromise('ffmpeg -version');
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}🎬 Conversor de Vídeos .MOV → .MP4${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  // Verificar se FFmpeg está instalado
  const hasFFmpeg = await checkFFmpeg();
  if (!hasFFmpeg) {
    console.error(`${colors.red}❌ FFmpeg não encontrado!${colors.reset}`);
    console.log(`\n${colors.yellow}📥 Instale o FFmpeg:${colors.reset}`);
    console.log(`   Windows: ${colors.blue}choco install ffmpeg${colors.reset} ou baixe em https://ffmpeg.org`);
    console.log(`   Mac: ${colors.blue}brew install ffmpeg${colors.reset}`);
    console.log(`   Linux: ${colors.blue}sudo apt install ffmpeg${colors.reset}\n`);
    process.exit(1);
  }

  const videosDir = join(__dirname, 'public', 'videos');

  console.log(`${colors.yellow}📂 Procurando vídeos em: ${videosDir}${colors.reset}\n`);

  const videoFiles = await findVideoFiles(videosDir);

  if (videoFiles.length === 0) {
    console.log(`${colors.yellow}⚠️  Nenhum arquivo .MOV encontrado${colors.reset}`);
    return;
  }

  console.log(`${colors.green}✨ Encontrados ${videoFiles.length} vídeo(s)${colors.reset}\n`);

  let converted = 0;
  let failed = 0;

  for (const videoPath of videoFiles) {
    const success = await convertVideo(videoPath);
    if (success) {
      converted++;
    } else {
      failed++;
    }
    console.log(''); // linha em branco
  }

  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}✅ Conversões concluídas: ${converted}${colors.reset}`);
  if (failed > 0) {
    console.log(`${colors.red}❌ Falhas: ${failed}${colors.reset}`);
  }
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  console.log(`${colors.yellow}📝 Próximos passos:${colors.reset}`);
  console.log(`   1. Atualize as referências nos arquivos .jsx de .MOV para .mp4`);
  console.log(`   2. Teste localmente: ${colors.blue}npm run dev${colors.reset}`);
  console.log(`   3. Faça commit e deploy: ${colors.blue}git add . && git commit -m "Convert videos to MP4" && git push${colors.reset}\n`);
}

main().catch(console.error);

import { v2 as cloudinary } from 'cloudinary';
import { config } from 'dotenv';
import { readdir, stat, writeFile } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m',
  cyan: '\x1b[96m',
};

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function findVideoFiles(dir, files = [], baseDir = dir) {
  const items = await readdir(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stats = await stat(fullPath);

    if (stats.isDirectory()) {
      await findVideoFiles(fullPath, files, baseDir);
    } else if (item.endsWith('.mp4')) {
      // Get relative path for folder structure
      const relativePath = fullPath.replace(baseDir + '\\', '').replace(/\\/g, '/');
      files.push({ fullPath, relativePath });
    }
  }

  return files;
}

async function uploadVideo(filePath, relativePath) {
  const fileName = basename(filePath, '.mp4');
  const fileSize = (await stat(filePath)).size / (1024 * 1024); // MB

  console.log(`${colors.blue}📤 Uploading: ${relativePath} (${fileSize.toFixed(1)}MB)${colors.reset}`);

  try {
    // Create a unique public_id maintaining folder structure
    const publicId = `site-matheus/videos/${relativePath.replace('.mp4', '')}`;

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      public_id: publicId,
      folder: 'site-matheus/videos',
      overwrite: true,
      // Video transformation for optimization
      eager: [
        {
          format: 'mp4',
          quality: 'auto',
          fetch_format: 'auto',
        }
      ],
      eager_async: false,
    });

    console.log(`${colors.green}✅ Uploaded: ${relativePath}${colors.reset}`);
    console.log(`${colors.cyan}   URL: ${result.secure_url}${colors.reset}\n`);

    return {
      originalPath: relativePath,
      cloudinaryUrl: result.secure_url,
      publicId: result.public_id,
      size: fileSize,
    };
  } catch (error) {
    console.error(`${colors.red}❌ Error uploading ${relativePath}: ${error.message}${colors.reset}\n`);
    return null;
  }
}

async function main() {
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}☁️  Upload de Vídeos para Cloudinary${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  // Verify credentials
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error(`${colors.red}❌ Credenciais do Cloudinary não encontradas!${colors.reset}\n`);
    console.log(`${colors.yellow}Adicione no arquivo .env:${colors.reset}`);
    console.log(`${colors.cyan}CLOUDINARY_CLOUD_NAME=seu_cloud_name${colors.reset}`);
    console.log(`${colors.cyan}CLOUDINARY_API_KEY=sua_api_key${colors.reset}`);
    console.log(`${colors.cyan}CLOUDINARY_API_SECRET=seu_api_secret${colors.reset}\n`);
    console.log(`${colors.yellow}Encontre essas credenciais em:${colors.reset}`);
    console.log(`${colors.blue}https://console.cloudinary.com/console${colors.reset}\n`);
    process.exit(1);
  }

  console.log(`${colors.cyan}Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}${colors.reset}`);
  console.log(`${colors.yellow}📂 Procurando vídeos em: public/videos/${colors.reset}\n`);

  const videosDir = join(__dirname, 'public', 'videos');
  const videoFiles = await findVideoFiles(videosDir);

  if (videoFiles.length === 0) {
    console.log(`${colors.yellow}⚠️  Nenhum arquivo .mp4 encontrado${colors.reset}`);
    return;
  }

  console.log(`${colors.green}✨ Encontrados ${videoFiles.length} vídeo(s)${colors.reset}\n`);

  const uploadResults = [];
  let uploaded = 0;
  let failed = 0;

  for (const { fullPath, relativePath } of videoFiles) {
    const result = await uploadVideo(fullPath, relativePath);
    if (result) {
      uploadResults.push(result);
      uploaded++;
    } else {
      failed++;
    }
  }

  // Save mapping file
  const mappingFile = join(__dirname, 'cloudinary-urls.json');
  await writeFile(mappingFile, JSON.stringify(uploadResults, null, 2));

  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}✅ Uploads concluídos: ${uploaded}${colors.reset}`);
  if (failed > 0) {
    console.log(`${colors.red}❌ Falhas: ${failed}${colors.reset}`);
  }
  console.log(`${colors.yellow}📄 URLs salvas em: cloudinary-urls.json${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  console.log(`${colors.yellow}📝 Próximo passo:${colors.reset}`);
  console.log(`   Vou atualizar o código para usar as URLs do Cloudinary...${colors.reset}\n`);

  return uploadResults;
}

main().catch(console.error);

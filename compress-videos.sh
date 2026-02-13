#!/bin/bash

# Compressão AGRESSIVA para Vercel (max 50MB por arquivo)
# Uso: ./compress-videos.sh

BLUE='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}🗜️  Compressor de Vídeos para Vercel${NC}"
echo -e "${YELLOW}Target: <50MB por arquivo${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

# Verificar FFmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}❌ FFmpeg não encontrado!${NC}"
    exit 1
fi

# Processar cada vídeo MP4
find public/videos -name "*.mp4" -type f | while read -r file; do
    size_mb=$(du -m "$file" | cut -f1)
    filename=$(basename "$file")

    if [ $size_mb -gt 50 ]; then
        echo -e "${YELLOW}🗜️  Comprimindo: $filename (${size_mb}MB)${NC}"

        temp_file="${file%.mp4}_compressed.mp4"

        # Compressão agressiva: CRF 32, resolução reduzida, bitrate limitado
        ffmpeg -i "$file" \
            -c:v libx264 \
            -crf 32 \
            -preset faster \
            -vf "scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease" \
            -maxrate 1M \
            -bufsize 2M \
            -c:a aac \
            -b:a 96k \
            -movflags +faststart \
            "$temp_file" \
            -y \
            -loglevel error 2>&1

        if [ $? -eq 0 ]; then
            new_size_mb=$(du -m "$temp_file" | cut -f1)

            if [ $new_size_mb -lt 50 ]; then
                mv "$temp_file" "$file"
                echo -e "${GREEN}✅ ${filename}: ${size_mb}MB → ${new_size_mb}MB${NC}"
            else
                echo -e "${RED}❌ Ainda muito grande (${new_size_mb}MB), tentando mais...${NC}"

                # Compressão EXTRA agressiva
                ffmpeg -i "$file" \
                    -c:v libx264 \
                    -crf 35 \
                    -preset faster \
                    -vf "scale='min(960,iw)':'min(540,ih)':force_original_aspect_ratio=decrease" \
                    -maxrate 800k \
                    -bufsize 1600k \
                    -c:a aac \
                    -b:a 64k \
                    -movflags +faststart \
                    "$temp_file" \
                    -y \
                    -loglevel error 2>&1

                final_size_mb=$(du -m "$temp_file" | cut -f1)
                mv "$temp_file" "$file"
                echo -e "${GREEN}✅ ${filename}: ${size_mb}MB → ${final_size_mb}MB${NC}"
            fi
        else
            echo -e "${RED}❌ Erro ao comprimir ${filename}${NC}"
            rm -f "$temp_file"
        fi
    else
        echo -e "${GREEN}✓ ${filename} (${size_mb}MB) - OK${NC}"
    fi
    echo ""
done

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Compressão concluída!${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

#!/bin/bash

# Script para converter vídeos .MOV para .MP4
# Uso: ./convert-videos.sh

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}🎬 Conversor de Vídeos .MOV → .MP4${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

# Verificar se FFmpeg está instalado
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}❌ FFmpeg não encontrado!${NC}"
    echo ""
    echo -e "${YELLOW}📥 Instale o FFmpeg:${NC}"
    echo -e "   Windows: ${BLUE}choco install ffmpeg${NC}"
    echo -e "   Mac:     ${BLUE}brew install ffmpeg${NC}"
    echo -e "   Linux:   ${BLUE}sudo apt install ffmpeg${NC}"
    echo ""
    exit 1
fi

echo -e "${YELLOW}📂 Procurando vídeos em: public/videos/${NC}"
echo ""

# Contador
total=0
converted=0
failed=0

# Encontrar todos os arquivos .MOV e .mov
while IFS= read -r -d '' file; do
    ((total++))
    filename=$(basename "$file")
    output="${file%.*}.mp4"

    echo -e "${BLUE}🔄 Convertendo: $filename${NC}"

    # Converter com FFmpeg
    if ffmpeg -i "$file" \
        -c:v libx264 \
        -crf 28 \
        -preset fast \
        -c:a aac \
        -b:a 128k \
        -movflags +faststart \
        -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease" \
        "$output" \
        -y \
        -loglevel error 2>&1; then

        echo -e "${GREEN}✅ Sucesso: $filename → $(basename "$output")${NC}"
        ((converted++))
    else
        echo -e "${RED}❌ Erro ao converter: $filename${NC}"
        ((failed++))
    fi
    echo ""
done < <(find public/videos -type f \( -iname "*.mov" \) -print0)

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Total encontrado: $total${NC}"
echo -e "${GREEN}✅ Convertidos: $converted${NC}"
if [ $failed -gt 0 ]; then
    echo -e "${RED}❌ Falhas: $failed${NC}"
fi
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

if [ $converted -gt 0 ]; then
    echo -e "${YELLOW}📝 Próximos passos:${NC}"
    echo -e "   1. As referências no código já foram atualizadas para .mp4"
    echo -e "   2. Teste localmente: ${BLUE}npm run dev${NC}"
    echo -e "   3. Deploy: ${BLUE}git add . && git commit -m 'Convert videos to MP4' && git push${NC}"
    echo ""
fi

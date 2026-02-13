# 🎬 Guia: Correção dos Vídeos

## 🔴 Problema
Os vídeos `.MOV` não carregam corretamente no mobile/Vercel por:
- Formato QuickTime (.MOV) tem suporte limitado em navegadores mobile
- Arquivos muito grandes para streaming web
- Problemas de MIME type no deploy

## ✅ Solução: Converter para MP4

### Passo 1: Instalar FFmpeg

**Windows:**
```bash
choco install ffmpeg
# ou baixe em: https://ffmpeg.org/download.html
```

**Mac:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg
```

### Passo 2: Converter os Vídeos

Execute o script de conversão:
```bash
npm run convert-videos
```

Este script irá:
- Procurar todos os arquivos `.MOV` em `public/videos/`
- Converter para `.mp4` otimizado para web/mobile
- Reduzir tamanho mantendo qualidade visual
- Otimizar para streaming (faststart)

### Passo 3: Atualizar Referências no Código

Abra `src/App.jsx` e substitua todas as extensões `.MOV` e `.mov` por `.mp4`:

**Antes:**
```jsx
{ type: "video", src: "/videos/dia-30.MOV" }
{ type: "video", src: "/videos/dia-31.mov" }
```

**Depois:**
```jsx
{ type: "video", src: "/videos/dia-30.mp4" }
{ type: "video", src: "/videos/dia-31.mp4" }
```

### Passo 4: Testar e Deploy

```bash
# Testar localmente
npm run dev

# Build e verificar
npm run build
npm run preview

# Commit e push para Vercel
git add .
git commit -m "Convert videos to MP4 for better compatibility"
git push
```

## 📊 Comparação de Tamanho

Após conversão, você deve ver redução de ~30-50% no tamanho dos arquivos:
- `.MOV` original: ~15-30 MB
- `.mp4` convertido: ~8-15 MB

## 🎯 Configurações de Conversão

O script usa configurações otimizadas:
- **Codec**: H.264 (melhor compatibilidade)
- **CRF**: 28 (boa qualidade, tamanho reduzido)
- **Audio**: AAC 128kbps
- **Faststart**: Sim (streaming otimizado)
- **Max Resolution**: 1920x1080 (HD)

## 🆘 Alternativa: Hospedar em CDN

Se os vídeos ainda forem muito grandes após conversão, considere usar um CDN:

### Cloudinary (Grátis até 25GB)
1. Crie conta: https://cloudinary.com
2. Upload dos vídeos
3. Use URLs do Cloudinary no código

### Bunny CDN
1. Crie conta: https://bunny.net
2. Upload para storage
3. Use URLs do Bunny no código

## 📝 Notas Importantes

- ✅ O componente `VideoItem` já tem fallback para erros
- ✅ Já tenta carregar .mp4 automaticamente se .MOV falhar
- ✅ Mostra loading spinner enquanto carrega
- ✅ Mostra mensagem amigável se falhar
- ⚠️ Mantenha os arquivos `.MOV` originais como backup

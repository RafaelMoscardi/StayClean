# Stay Clean Higienização & Estética Automotiva: site

Site estático (HTML, CSS e JS puros, sem build). Para publicar, envie o conteúdo desta pasta para a hospedagem.

## Rodar localmente

Dentro desta pasta:

```bash
python -m http.server 5176
```

Depois abra http://localhost:5176. Também funciona abrindo o `index.html` com duplo clique.

## Onde editar

| O quê | Onde |
| --- | --- |
| Horários | `js/main.js` (`SCHEDULE`, usado no "Aberto agora") **e** a tabela `.hours` + o rodapé em `index.html` |
| WhatsApp | `index.html`: links `wa.me/5541996048398` (cada serviço já abre com uma mensagem pronta) |
| Serviços, textos, avaliações | `index.html` |
| Fotos | `assets/img/` (AVIF + WebP + JPG de cada foto) |
| Cores, fontes, espaçamentos | `css/styles.css`, bloco `:root` |

## Antes de publicar

Troque `og:image`, `image` e `logo` (JSON-LD) em `index.html` por URLs absolutas do domínio final.

## Imagens, logo e fontes

- Fotos tiradas dos posts do Instagram @staycleancuritiba, no tamanho em que foram publicadas (360 a 512 px de largura). Para um site definitivo, vale pedir os originais em alta ao cliente.
- Na foto principal (Jeep), a placa do carro do cliente foi desfocada. A foto do estofado foi recortada para tirar o telefone e o @ que vinham escritos no vídeo.
- O logo (casinha com as bolhas) foi redesenhado em vetor a partir da foto de perfil e fica no `<symbol id="logo">` do `index.html`; o arquivo original do cliente não estava disponível.
- `assets/img/og-image.jpg`: imagem de compartilhamento 1200×630.
- `assets/icons/`: favicon (casinha com "SC") e ícones do app.

Fontes auto-hospedadas (SIL Open Font License): Oswald (títulos) e Figtree (textos), subconjunto latin.

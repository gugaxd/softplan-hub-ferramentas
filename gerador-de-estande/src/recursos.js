/* Imagens, logos e vídeo do estande, servidos pelo próprio hub (nada vem da
   internet). No HTML original vinham embutidos e chegavam ao código por
   window.__resources; as chaves são as mesmas, para o módulo do estande
   mudar o mínimo. */
import logoBranco from "./recursos/logo-branco.png";
import logoMono from "./recursos/logo-mono.png";
import logoRoxo from "./recursos/logo-roxo.png";
import simboloS from "./recursos/simbolo-s.svg";
import prodSajTribunais from "./recursos/prod-saj-tribunais.svg";
import prodSajProcuradorias from "./recursos/prod-saj-procuradorias.svg";
import prodSajDefensorias from "./recursos/prod-saj-defensorias.svg";
import prod1doc from "./recursos/prod-1doc.svg";
import prodObras from "./recursos/prod-obras.svg";
import prodSaff from "./recursos/prod-saff.svg";
import fotoObras from "./recursos/foto-obras.jpg";
import fotoCidades from "./recursos/foto-cidades.jpg";
import fotoProcessos from "./recursos/foto-processos.jpg";
import fotoJustica from "./recursos/foto-justica.jpg";
import fotoCidadaos from "./recursos/foto-cidadaos.jpg";
import fotoSede from "./recursos/foto-sede.jpg";
import gradiente1 from "./recursos/gradiente-1.png";
import gradiente2 from "./recursos/gradiente-2.png";
import softpointDuo from "./recursos/softpoint-duo.webp";
import softpointCascata from "./recursos/softpoint-cascata.webp";
import grid01 from "./recursos/grid-01.png";
import videoSoftpoint from "./recursos/video-softpoint.mp4";

export const RECURSOS = {
  logoBranco,
  logoMono,
  logoRoxo,
  simboloS,
  prod_saj_tribunais: prodSajTribunais,
  prod_saj_procuradorias: prodSajProcuradorias,
  prod_saj_defensorias: prodSajDefensorias,
  prod_1doc: prod1doc,
  prod_obras: prodObras,
  prod_saff: prodSaff,
  img_obras_jpg: fotoObras,
  img_cidades_jpg: fotoCidades,
  img_processos_jpg: fotoProcessos,
  img_justica_jpg: fotoJustica,
  img_cidadaos_jpg: fotoCidadaos,
  img_sede_jpg: fotoSede,
  img_gradiente_1_png: gradiente1,
  img_gradiente_2_png: gradiente2,
  img_softpoint_duo_png: softpointDuo,
  img_softpoint_cascata_png: softpointCascata,
  img_grid_01_png: grid01,
  videoSoftpoint,
};

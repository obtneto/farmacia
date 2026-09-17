/*
 Navicat Premium Dump SQL

 Source Server         : MySQL-Dev
 Source Server Type    : MySQL
 Source Server Version : 80403 (8.4.3)
 Source Host           : 172.23.42.17:3306
 Source Schema         : fsph_farmacia

 Target Server Type    : MySQL
 Target Server Version : 80403 (8.4.3)
 File Encoding         : 65001

 Date: 10/09/2026 10:11:35
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for tb_boname
-- ----------------------------
DROP TABLE IF EXISTS `tb_boname`;
CREATE TABLE `tb_boname` (
  `bona_id` int NOT NULL,
  `bona_codigo` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bona_descr` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bona_qt_ui` mediumint DEFAULT NULL,
  `bona_diag_id` mediumint DEFAULT NULL,
  `bona_ativo` tinyint DEFAULT NULL,
  PRIMARY KEY (`bona_id`) USING BTREE,
  UNIQUE KEY `bona_codigo` (`bona_codigo`) USING BTREE,
  FULLTEXT KEY `search_boname` (`bona_descr`,`bona_codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela Farmacia';

-- ----------------------------
-- Records of tb_boname
-- ----------------------------
BEGIN;
INSERT INTO `tb_boname` (`bona_id`, `bona_codigo`, `bona_descr`, `bona_qt_ui`, `bona_diag_id`, `bona_ativo`) VALUES (1, 'VIII500', 'FATOR VIII 500 UI', 500, 1, 1);
INSERT INTO `tb_boname` (`bona_id`, `bona_codigo`, `bona_descr`, `bona_qt_ui`, `bona_diag_id`, `bona_ativo`) VALUES (2, 'FEI500', 'FEIBA 500 UI', 500, 4, 1);
INSERT INTO `tb_boname` (`bona_id`, `bona_codigo`, `bona_descr`, `bona_qt_ui`, `bona_diag_id`, `bona_ativo`) VALUES (3, 'VII250', 'FATOR VII 250 UI', 250, 2, 1);
INSERT INTO `tb_boname` (`bona_id`, `bona_codigo`, `bona_descr`, `bona_qt_ui`, `bona_diag_id`, `bona_ativo`) VALUES (4, 'VII450', 'FATOR VII 450 UI', 450, 2, 1);
INSERT INTO `tb_boname` (`bona_id`, `bona_codigo`, `bona_descr`, `bona_qt_ui`, `bona_diag_id`, `bona_ativo`) VALUES (5, 'FEI2500', 'FEIBA 2500 UI', 2500, 4, 1);
INSERT INTO `tb_boname` (`bona_id`, `bona_codigo`, `bona_descr`, `bona_qt_ui`, `bona_diag_id`, `bona_ativo`) VALUES (6, 'VIII600Y', 'FATOR VIIIY 600 UI', 600, 2, 1);
INSERT INTO `tb_boname` (`bona_id`, `bona_codigo`, `bona_descr`, `bona_qt_ui`, `bona_diag_id`, `bona_ativo`) VALUES (7, 'FEI1000', 'FEIBA 1000 UI', 1000, 3, 1);
INSERT INTO `tb_boname` (`bona_id`, `bona_codigo`, `bona_descr`, `bona_qt_ui`, `bona_diag_id`, `bona_ativo`) VALUES (8, 'VIII250', 'FATOR VIII 250', 250, 1, 1);
INSERT INTO `tb_boname` (`bona_id`, `bona_codigo`, `bona_descr`, `bona_qt_ui`, `bona_diag_id`, `bona_ativo`) VALUES (9, 'VIII250R', 'FATOR VIII 250 UI RECOMBINANTE', 250, 1, 1);
INSERT INTO `tb_boname` (`bona_id`, `bona_codigo`, `bona_descr`, `bona_qt_ui`, `bona_diag_id`, `bona_ativo`) VALUES (10, 'VIII500R', 'FATOR VIII 500 UI RECOMBINANTE', 500, 1, 1);
INSERT INTO `tb_boname` (`bona_id`, `bona_codigo`, `bona_descr`, `bona_qt_ui`, `bona_diag_id`, `bona_ativo`) VALUES (11, 'VIII1000R', 'FATOR VIII 1000 UI RECOMBINANTE', 1000, 1, 1);
INSERT INTO `tb_boname` (`bona_id`, `bona_codigo`, `bona_descr`, `bona_qt_ui`, `bona_diag_id`, `bona_ativo`) VALUES (12, 'VII500', 'FATOR VII 500 UI', 500, 2, 1);
INSERT INTO `tb_boname` (`bona_id`, `bona_codigo`, `bona_descr`, `bona_qt_ui`, `bona_diag_id`, `bona_ativo`) VALUES (13, 'CXP500', 'COMPLEXO PRONTOMINICO 500 UI', 500, 3, 1);
COMMIT;

-- ----------------------------
-- Table structure for tb_controle_ddu
-- ----------------------------
DROP TABLE IF EXISTS `tb_controle_ddu`;
CREATE TABLE `tb_controle_ddu` (
  `cdd_id` int NOT NULL,
  `cdd_req_num` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cdd_date` datetime DEFAULT NULL,
  `cdd_pac_id` int DEFAULT NULL,
  `cdd_status` tinyint DEFAULT NULL COMMENT '0 = Aberto; 1 = Fechado',
  PRIMARY KEY (`cdd_id`),
  UNIQUE KEY `idx_req_num` (`cdd_req_num`) USING BTREE,
  CONSTRAINT `fk_cdd_requisicoes` FOREIGN KEY (`cdd_req_num`) REFERENCES `tb_requisicoes` (`req_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela Farmacia';

-- ----------------------------
-- Records of tb_controle_ddu
-- ----------------------------
BEGIN;
INSERT INTO `tb_controle_ddu` (`cdd_id`, `cdd_req_num`, `cdd_date`, `cdd_pac_id`, `cdd_status`) VALUES (1, 'REQ20265280', '2026-07-27 10:38:44', 929, 1);
INSERT INTO `tb_controle_ddu` (`cdd_id`, `cdd_req_num`, `cdd_date`, `cdd_pac_id`, `cdd_status`) VALUES (2, 'REQ20260422', '2026-08-18 10:32:50', 208, 0);
INSERT INTO `tb_controle_ddu` (`cdd_id`, `cdd_req_num`, `cdd_date`, `cdd_pac_id`, `cdd_status`) VALUES (3, 'REQ20265522', '2026-08-26 07:48:59', 499, 0);
COMMIT;

-- ----------------------------
-- Table structure for tb_demandas_especificas
-- ----------------------------
DROP TABLE IF EXISTS `tb_demandas_especificas`;
CREATE TABLE `tb_demandas_especificas` (
  `dem_id` int NOT NULL,
  `dem_pac_id` int DEFAULT NULL,
  `dem_medico_assis` varchar(125) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `dem_medico_crm` varchar(25) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `dem_responsavel` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `dem_diag_id` int DEFAULT NULL,
  PRIMARY KEY (`dem_id`) USING BTREE,
  UNIQUE KEY `idx_dem_pac_id` (`dem_pac_id`) USING BTREE,
  KEY `fk_demanda_diag` (`dem_diag_id`),
  CONSTRAINT `fk_demanda_diag` FOREIGN KEY (`dem_diag_id`) REFERENCES `tb_diagnosticos` (`diag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela Farmacia';

-- ----------------------------
-- Records of tb_demandas_especificas
-- ----------------------------
BEGIN;
INSERT INTO `tb_demandas_especificas` (`dem_id`, `dem_pac_id`, `dem_medico_assis`, `dem_medico_crm`, `dem_responsavel`, `dem_diag_id`) VALUES (1, 188, 'RICHER', '2931', '', 5);
COMMIT;

-- ----------------------------
-- Table structure for tb_depositos
-- ----------------------------
DROP TABLE IF EXISTS `tb_depositos`;
CREATE TABLE `tb_depositos` (
  `dep_id` int NOT NULL,
  `dep_descr` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `dep_ativo` tinyint DEFAULT NULL,
  `dep_bloqueado` tinyint DEFAULT NULL,
  PRIMARY KEY (`dep_id`) USING BTREE,
  FULLTEXT KEY `search_depositos` (`dep_descr`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela Farmacia';

-- ----------------------------
-- Records of tb_depositos
-- ----------------------------
BEGIN;
INSERT INTO `tb_depositos` (`dep_id`, `dep_descr`, `dep_ativo`, `dep_bloqueado`) VALUES (1, 'FARMACIA', 1, 0);
INSERT INTO `tb_depositos` (`dep_id`, `dep_descr`, `dep_ativo`, `dep_bloqueado`) VALUES (2, 'ALMOXARIFADO', 1, 0);
INSERT INTO `tb_depositos` (`dep_id`, `dep_descr`, `dep_ativo`, `dep_bloqueado`) VALUES (3, 'PRODUÇÃO', 1, 0);
INSERT INTO `tb_depositos` (`dep_id`, `dep_descr`, `dep_ativo`, `dep_bloqueado`) VALUES (4, 'RESERVADO', 1, 0);
COMMIT;

-- ----------------------------
-- Table structure for tb_diagnosticos
-- ----------------------------
DROP TABLE IF EXISTS `tb_diagnosticos`;
CREATE TABLE `tb_diagnosticos` (
  `diag_id` int NOT NULL,
  `diag_descr` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `diag_ativo` tinyint DEFAULT '0',
  PRIMARY KEY (`diag_id`) USING BTREE,
  FULLTEXT KEY `search_diagnosticos` (`diag_descr`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela Farmacia';

-- ----------------------------
-- Records of tb_diagnosticos
-- ----------------------------
BEGIN;
INSERT INTO `tb_diagnosticos` (`diag_id`, `diag_descr`, `diag_ativo`) VALUES (1, 'HEMOFILIA A', 1);
INSERT INTO `tb_diagnosticos` (`diag_id`, `diag_descr`, `diag_ativo`) VALUES (2, 'HEMOFILIA B', 1);
INSERT INTO `tb_diagnosticos` (`diag_id`, `diag_descr`, `diag_ativo`) VALUES (3, 'DOENÇA DE VON WILLEBRAND', 1);
INSERT INTO `tb_diagnosticos` (`diag_id`, `diag_descr`, `diag_ativo`) VALUES (4, 'HEMOFILIA A E B', 1);
INSERT INTO `tb_diagnosticos` (`diag_id`, `diag_descr`, `diag_ativo`) VALUES (5, 'DOENCA DE GAUCHER', 1);
COMMIT;

-- ----------------------------
-- Table structure for tb_entradas
-- ----------------------------
DROP TABLE IF EXISTS `tb_entradas`;
CREATE TABLE `tb_entradas` (
  `ent_id` int NOT NULL AUTO_INCREMENT,
  `ent_dep_id` int DEFAULT NULL,
  `ent_date` date DEFAULT NULL,
  `ent_doc` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ent_for_id` int DEFAULT NULL,
  `ent_pac_id` int DEFAULT NULL,
  `ent_status` tinyint DEFAULT NULL COMMENT '0 = NÃO APROVADO; 1 = APROVADO',
  `ent_user_digit` varchar(80) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ent_dt_digit` datetime DEFAULT NULL,
  `ent_user_aprov` varchar(80) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ent_dt_aprov` datetime DEFAULT NULL,
  PRIMARY KEY (`ent_id`),
  UNIQUE KEY `idx_entradas_ent_doc` (`ent_doc`),
  KEY `fk_entradas_depositos` (`ent_dep_id`),
  KEY `fk_entradas_fornecedores` (`ent_for_id`),
  CONSTRAINT `fk_entradas_depositos` FOREIGN KEY (`ent_dep_id`) REFERENCES `tb_depositos` (`dep_id`),
  CONSTRAINT `fk_entradas_fornecedores` FOREIGN KEY (`ent_for_id`) REFERENCES `tb_fornecedores` (`for_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela Farmacia';

-- ----------------------------
-- Records of tb_entradas
-- ----------------------------
BEGIN;
INSERT INTO `tb_entradas` (`ent_id`, `ent_dep_id`, `ent_date`, `ent_doc`, `ent_for_id`, `ent_pac_id`, `ent_status`, `ent_user_digit`, `ent_dt_digit`, `ent_user_aprov`, `ent_dt_aprov`) VALUES (1, 2, '2026-07-06', 'ENT20268687', 4, NULL, 1, 'ovidio.neto', '2026-07-07 08:39:13', 'ovidio.neto', '2026-07-07 08:39:35');
INSERT INTO `tb_entradas` (`ent_id`, `ent_dep_id`, `ent_date`, `ent_doc`, `ent_for_id`, `ent_pac_id`, `ent_status`, `ent_user_digit`, `ent_dt_digit`, `ent_user_aprov`, `ent_dt_aprov`) VALUES (2, 1, '2026-07-09', 'ENT20265742', 3, 188, 1, 'ovidio.neto', '2026-07-09 08:50:18', 'ovidio.neto', '2026-07-09 08:50:51');
INSERT INTO `tb_entradas` (`ent_id`, `ent_dep_id`, `ent_date`, `ent_doc`, `ent_for_id`, `ent_pac_id`, `ent_status`, `ent_user_digit`, `ent_dt_digit`, `ent_user_aprov`, `ent_dt_aprov`) VALUES (3, 1, '2026-07-21', 'ENT20263461', 4, NULL, 1, 'ovidio.neto', '2026-07-22 09:02:53', 'ovidio.neto', '2026-07-22 09:03:11');
INSERT INTO `tb_entradas` (`ent_id`, `ent_dep_id`, `ent_date`, `ent_doc`, `ent_for_id`, `ent_pac_id`, `ent_status`, `ent_user_digit`, `ent_dt_digit`, `ent_user_aprov`, `ent_dt_aprov`) VALUES (4, 1, '2026-07-30', 'ENT20264904', 2, NULL, 1, 'ovidio.neto', '2026-07-31 07:42:36', 'ovidio.neto', '2026-07-31 07:43:24');
COMMIT;

-- ----------------------------
-- Table structure for tb_estoque
-- ----------------------------
DROP TABLE IF EXISTS `tb_estoque`;
CREATE TABLE `tb_estoque` (
  `est_id` int NOT NULL,
  `est_dep_id` int DEFAULT NULL,
  `est_med_id` int DEFAULT NULL,
  `est_lote` varchar(60) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `est_saldo_bloqueado` mediumint DEFAULT NULL,
  `est_saldo_disponivel` mediumint DEFAULT '0',
  `est_validade` date DEFAULT NULL,
  PRIMARY KEY (`est_id`),
  UNIQUE KEY `idx_itens_estoque` (`est_dep_id`,`est_med_id`,`est_lote`) USING BTREE,
  KEY `fk_estoque_medicamento` (`est_med_id`),
  CONSTRAINT `fk_estoque_deposito` FOREIGN KEY (`est_dep_id`) REFERENCES `tb_depositos` (`dep_id`),
  CONSTRAINT `fk_estoque_medicamento` FOREIGN KEY (`est_med_id`) REFERENCES `tb_medicamentos` (`med_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela Farmacia';

-- ----------------------------
-- Records of tb_estoque
-- ----------------------------
BEGIN;
INSERT INTO `tb_estoque` (`est_id`, `est_dep_id`, `est_med_id`, `est_lote`, `est_saldo_bloqueado`, `est_saldo_disponivel`, `est_validade`) VALUES (2, 2, 3, 'LEAB20M501', 0, 325, '2027-12-31');
INSERT INTO `tb_estoque` (`est_id`, `est_dep_id`, `est_med_id`, `est_lote`, `est_saldo_bloqueado`, `est_saldo_disponivel`, `est_validade`) VALUES (3, 1, 6, 'TLG5670AX', 5, 10, '2026-12-31');
INSERT INTO `tb_estoque` (`est_id`, `est_dep_id`, `est_med_id`, `est_lote`, `est_saldo_bloqueado`, `est_saldo_disponivel`, `est_validade`) VALUES (4, 2, 6, 'TLG5670AX', 0, 0, '2026-12-30');
INSERT INTO `tb_estoque` (`est_id`, `est_dep_id`, `est_med_id`, `est_lote`, `est_saldo_bloqueado`, `est_saldo_disponivel`, `est_validade`) VALUES (5, 1, 276, 'BET5002AC', 0, 0, '2027-03-31');
INSERT INTO `tb_estoque` (`est_id`, `est_dep_id`, `est_med_id`, `est_lote`, `est_saldo_bloqueado`, `est_saldo_disponivel`, `est_validade`) VALUES (6, 2, 276, 'BET5002AC', 0, 135, '2027-03-30');
INSERT INTO `tb_estoque` (`est_id`, `est_dep_id`, `est_med_id`, `est_lote`, `est_saldo_bloqueado`, `est_saldo_disponivel`, `est_validade`) VALUES (7, 1, 1, 'DP26310741', 0, 92, '2027-07-31');
INSERT INTO `tb_estoque` (`est_id`, `est_dep_id`, `est_med_id`, `est_lote`, `est_saldo_bloqueado`, `est_saldo_disponivel`, `est_validade`) VALUES (8, 1, 3, 'LEAB20M501', 0, 25, '2027-12-29');
INSERT INTO `tb_estoque` (`est_id`, `est_dep_id`, `est_med_id`, `est_lote`, `est_saldo_bloqueado`, `est_saldo_disponivel`, `est_validade`) VALUES (9, 1, 3, 'LE20ABM520', 0, 50, '2027-11-29');
INSERT INTO `tb_estoque` (`est_id`, `est_dep_id`, `est_med_id`, `est_lote`, `est_saldo_bloqueado`, `est_saldo_disponivel`, `est_validade`) VALUES (10, 2, 3, 'LE20ABM520', 0, 10, '2027-11-28');
COMMIT;

-- ----------------------------
-- Table structure for tb_fornecedores
-- ----------------------------
DROP TABLE IF EXISTS `tb_fornecedores`;
CREATE TABLE `tb_fornecedores` (
  `for_id` int NOT NULL,
  `for_razao_social` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `for_nome_fantasia` varchar(80) COLLATE utf8mb4_general_ci NOT NULL,
  `for_cnpj` varchar(14) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `for_logradouro` varchar(120) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `for_numero` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `for_bairro` varchar(80) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `for_cidade` varchar(80) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `for_uf` varchar(2) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `for_telefone` varchar(11) COLLATE utf8mb4_general_ci NOT NULL,
  `for_email` varchar(120) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `for_ativo` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`for_id`),
  UNIQUE KEY `idx_cnpj` (`for_cnpj`) USING BTREE,
  FULLTEXT KEY `search_fornecedores` (`for_razao_social`,`for_nome_fantasia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela Farmacia';

-- ----------------------------
-- Records of tb_fornecedores
-- ----------------------------
BEGIN;
INSERT INTO `tb_fornecedores` (`for_id`, `for_razao_social`, `for_nome_fantasia`, `for_cnpj`, `for_logradouro`, `for_numero`, `for_bairro`, `for_cidade`, `for_uf`, `for_telefone`, `for_email`, `for_ativo`) VALUES (1, 'HOSPITAL DE URGENCIAS DE SERGIPE', 'HUSE', NULL, NULL, NULL, NULL, 'ARACAJU', 'SE', '79999999999', NULL, 1);
INSERT INTO `tb_fornecedores` (`for_id`, `for_razao_social`, `for_nome_fantasia`, `for_cnpj`, `for_logradouro`, `for_numero`, `for_bairro`, `for_cidade`, `for_uf`, `for_telefone`, `for_email`, `for_ativo`) VALUES (2, 'HOSPITAL CIRURGIA', 'CIRURGIA', NULL, NULL, NULL, NULL, 'ARACAJU', 'SE', '79999988888', NULL, 1);
INSERT INTO `tb_fornecedores` (`for_id`, `for_razao_social`, `for_nome_fantasia`, `for_cnpj`, `for_logradouro`, `for_numero`, `for_bairro`, `for_cidade`, `for_uf`, `for_telefone`, `for_email`, `for_ativo`) VALUES (3, 'SECRETARIA ESTADUAL DE SAUDE', 'CASE', NULL, NULL, NULL, NULL, NULL, NULL, '7932258000', NULL, 1);
INSERT INTO `tb_fornecedores` (`for_id`, `for_razao_social`, `for_nome_fantasia`, `for_cnpj`, `for_logradouro`, `for_numero`, `for_bairro`, `for_cidade`, `for_uf`, `for_telefone`, `for_email`, `for_ativo`) VALUES (4, 'HEMOBRAS', 'HEMOBRAS', NULL, NULL, NULL, NULL, NULL, NULL, '7932258000', NULL, 1);
COMMIT;

-- ----------------------------
-- Table structure for tb_inventarios
-- ----------------------------
DROP TABLE IF EXISTS `tb_inventarios`;
CREATE TABLE `tb_inventarios` (
  `inv_id` int NOT NULL,
  `inv_date` date DEFAULT NULL,
  `inv_dep_id` int DEFAULT NULL,
  `inv_med_tipo_codigo` varchar(3) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `inv_status` tinyint DEFAULT '0' COMMENT '0 = Aberto; 1 = Fechado',
  `inv_tipo` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Parcial ou Total',
  `inv_num` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`inv_id`),
  UNIQUE KEY `inv_num` (`inv_num`) USING BTREE,
  KEY `fk_inventario_deposito` (`inv_dep_id`),
  KEY `fk_inventario_tipos_medicamentos` (`inv_med_tipo_codigo`),
  CONSTRAINT `fk_inventario_deposito` FOREIGN KEY (`inv_dep_id`) REFERENCES `tb_depositos` (`dep_id`),
  CONSTRAINT `fk_inventario_tipos_medicamentos` FOREIGN KEY (`inv_med_tipo_codigo`) REFERENCES `tb_tipos_medicamentos` (`tipo_codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela Farmacia';

-- ----------------------------
-- Records of tb_inventarios
-- ----------------------------
BEGIN;
INSERT INTO `tb_inventarios` (`inv_id`, `inv_date`, `inv_dep_id`, `inv_med_tipo_codigo`, `inv_status`, `inv_tipo`, `inv_num`) VALUES (1, '2026-08-18', 1, 'FT', 1, 'Parcial', 'INV20264331');
INSERT INTO `tb_inventarios` (`inv_id`, `inv_date`, `inv_dep_id`, `inv_med_tipo_codigo`, `inv_status`, `inv_tipo`, `inv_num`) VALUES (2, '2026-08-18', 1, 'FT', 1, 'Parcial', 'INV20263867');
COMMIT;

-- ----------------------------
-- Table structure for tb_itens_ddu
-- ----------------------------
DROP TABLE IF EXISTS `tb_itens_ddu`;
CREATE TABLE `tb_itens_ddu` (
  `ite_dd_id` int NOT NULL,
  `ite_dd_req_num` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ite_dd_med_id` int DEFAULT NULL,
  `ite_dd_lote` varchar(60) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ite_dd_qtde` mediumint DEFAULT NULL,
  `ite_dd_qtde_retorno` mediumint DEFAULT NULL,
  PRIMARY KEY (`ite_dd_id`),
  KEY `fk_itens_cdd` (`ite_dd_req_num`),
  KEY `fk_itens_med` (`ite_dd_med_id`) USING BTREE,
  CONSTRAINT `fk_itens_cdd` FOREIGN KEY (`ite_dd_req_num`) REFERENCES `tb_controle_ddu` (`cdd_req_num`),
  CONSTRAINT `fk_itens_dd_medicamentos` FOREIGN KEY (`ite_dd_med_id`) REFERENCES `tb_medicamentos` (`med_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tablea Farmacia';

-- ----------------------------
-- Records of tb_itens_ddu
-- ----------------------------
BEGIN;
INSERT INTO `tb_itens_ddu` (`ite_dd_id`, `ite_dd_req_num`, `ite_dd_med_id`, `ite_dd_lote`, `ite_dd_qtde`, `ite_dd_qtde_retorno`) VALUES (2, 'REQ20265280', 276, 'BET5002AC', 5, 5);
INSERT INTO `tb_itens_ddu` (`ite_dd_id`, `ite_dd_req_num`, `ite_dd_med_id`, `ite_dd_lote`, `ite_dd_qtde`, `ite_dd_qtde_retorno`) VALUES (3, 'REQ20260422', 3, 'LEAB20M501', 5, 4);
INSERT INTO `tb_itens_ddu` (`ite_dd_id`, `ite_dd_req_num`, `ite_dd_med_id`, `ite_dd_lote`, `ite_dd_qtde`, `ite_dd_qtde_retorno`) VALUES (4, 'REQ20265522', 3, 'LE20ABM520', 10, 0);
COMMIT;

-- ----------------------------
-- Table structure for tb_itens_demandas_especificas
-- ----------------------------
DROP TABLE IF EXISTS `tb_itens_demandas_especificas`;
CREATE TABLE `tb_itens_demandas_especificas` (
  `ite_id` int NOT NULL,
  `ite_dem_id` int DEFAULT NULL,
  `ite_dem_med_id` int DEFAULT NULL,
  `ite_dem_lote` varchar(60) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ite_dem_med_qtde` mediumint DEFAULT NULL,
  `ite_dem_med_ativo` tinyint DEFAULT NULL,
  `ite_ent_id` int DEFAULT NULL,
  PRIMARY KEY (`ite_id`),
  KEY `fx_itens_demandas` (`ite_dem_id`),
  KEY `fk_itens_dem_medicamentos` (`ite_dem_med_id`),
  KEY `fk_itens_dem_entradas` (`ite_ent_id`),
  CONSTRAINT `fk_itens_dem_entradas` FOREIGN KEY (`ite_ent_id`) REFERENCES `tb_entradas` (`ent_id`),
  CONSTRAINT `fk_itens_dem_medicamentos` FOREIGN KEY (`ite_dem_med_id`) REFERENCES `tb_medicamentos` (`med_id`),
  CONSTRAINT `fx_itens_demandas` FOREIGN KEY (`ite_dem_id`) REFERENCES `tb_demandas_especificas` (`dem_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela Farmacia';

-- ----------------------------
-- Records of tb_itens_demandas_especificas
-- ----------------------------
BEGIN;
INSERT INTO `tb_itens_demandas_especificas` (`ite_id`, `ite_dem_id`, `ite_dem_med_id`, `ite_dem_med_qtde`, `ite_dem_med_ativo`, `ite_ent_id`) VALUES (1, 1, 6, 5, 1, 2);
COMMIT;

-- ----------------------------
-- Table structure for tb_itens_entradas
-- ----------------------------
DROP TABLE IF EXISTS `tb_itens_entradas`;
CREATE TABLE `tb_itens_entradas` (
  `ite_id` int NOT NULL,
  `ite_ent_id` int DEFAULT NULL,
  `ite_ent_med_id` int DEFAULT NULL,
  `ite_ent_lote` varchar(60) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ite_ent_lote_validade` date DEFAULT NULL,
  `ite_ent_qtde` mediumint DEFAULT NULL,
  PRIMARY KEY (`ite_id`) USING BTREE,
  UNIQUE KEY `idx_item` (`ite_ent_id`,`ite_ent_med_id`,`ite_ent_lote`) USING BTREE,
  KEY `fk_itens_entradas` (`ite_ent_id`) USING BTREE,
  KEY `fk_itens_medicamentos` (`ite_ent_med_id`),
  CONSTRAINT `fk_itens_entradas` FOREIGN KEY (`ite_ent_id`) REFERENCES `tb_entradas` (`ent_id`),
  CONSTRAINT `fk_itens_medicamentos` FOREIGN KEY (`ite_ent_med_id`) REFERENCES `tb_medicamentos` (`med_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela Farmacia';

-- ----------------------------
-- Records of tb_itens_entradas
-- ----------------------------
BEGIN;
INSERT INTO `tb_itens_entradas` (`ite_id`, `ite_ent_id`, `ite_ent_med_id`, `ite_ent_lote`, `ite_ent_lote_validade`, `ite_ent_qtde`) VALUES (1, 1, 3, 'LEAB20M501', '2027-12-31', 350);
INSERT INTO `tb_itens_entradas` (`ite_id`, `ite_ent_id`, `ite_ent_med_id`, `ite_ent_lote`, `ite_ent_lote_validade`, `ite_ent_qtde`) VALUES (2, 2, 6, 'TLG5670AX', '2026-12-31', 15);
INSERT INTO `tb_itens_entradas` (`ite_id`, `ite_ent_id`, `ite_ent_med_id`, `ite_ent_lote`, `ite_ent_lote_validade`, `ite_ent_qtde`) VALUES (3, 3, 276, 'BET5002AC', '2027-03-31', 150);
INSERT INTO `tb_itens_entradas` (`ite_id`, `ite_ent_id`, `ite_ent_med_id`, `ite_ent_lote`, `ite_ent_lote_validade`, `ite_ent_qtde`) VALUES (4, 4, 1, 'DP26310741', '2027-07-31', 90);
COMMIT;

-- ----------------------------
-- Table structure for tb_itens_inventario
-- ----------------------------
DROP TABLE IF EXISTS `tb_itens_inventario`;
CREATE TABLE `tb_itens_inventario` (
  `iti_id` int NOT NULL,
  `iti_inv_num` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `iti_med_id` int DEFAULT NULL,
  `iti_lote` varchar(60) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `iti_validade` date DEFAULT NULL,
  `iti_qtde_estoque` mediumint DEFAULT '0',
  `iti_qtde_invent` mediumint DEFAULT '0',
  `iti_qtde_dif` mediumint GENERATED ALWAYS AS ((`iti_qtde_invent` - `iti_qtde_estoque`)) VIRTUAL,
  PRIMARY KEY (`iti_id`) USING BTREE,
  KEY `fk_itens_inv_medicamentos` (`iti_med_id`),
  KEY `fk_itens_inv_numero` (`iti_inv_num`),
  CONSTRAINT `fk_itens_inv_medicamentos` FOREIGN KEY (`iti_med_id`) REFERENCES `tb_medicamentos` (`med_id`),
  CONSTRAINT `fk_itens_inv_numero` FOREIGN KEY (`iti_inv_num`) REFERENCES `tb_inventarios` (`inv_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela Farmacia';

-- ----------------------------
-- Records of tb_itens_inventario
-- ----------------------------
BEGIN;
INSERT INTO `tb_itens_inventario` (`iti_id`, `iti_inv_num`, `iti_med_id`, `iti_lote`, `iti_validade`, `iti_qtde_estoque`, `iti_qtde_invent`) VALUES (1, 'INV20264331', 3, 'LEAB20M501', '2027-12-29', 5, 0);
INSERT INTO `tb_itens_inventario` (`iti_id`, `iti_inv_num`, `iti_med_id`, `iti_lote`, `iti_validade`, `iti_qtde_estoque`, `iti_qtde_invent`) VALUES (2, 'INV20264331', 3, 'LE20ABM520', '2027-11-30', 0, 50);
INSERT INTO `tb_itens_inventario` (`iti_id`, `iti_inv_num`, `iti_med_id`, `iti_lote`, `iti_validade`, `iti_qtde_estoque`, `iti_qtde_invent`) VALUES (3, 'INV20263867', 3, 'LE20ABM520', '2027-11-29', 50, 50);
INSERT INTO `tb_itens_inventario` (`iti_id`, `iti_inv_num`, `iti_med_id`, `iti_lote`, `iti_validade`, `iti_qtde_estoque`, `iti_qtde_invent`) VALUES (4, 'INV20263867', 3, 'LEAB20M501', '2027-12-29', 0, 5);
COMMIT;

-- ----------------------------
-- Table structure for tb_itens_requisicoes
-- ----------------------------
DROP TABLE IF EXISTS `tb_itens_requisicoes`;
CREATE TABLE `tb_itens_requisicoes` (
  `ite_id` int NOT NULL,
  `ite_req_id` int DEFAULT NULL,
  `ite_med_id` int DEFAULT NULL,
  `ite_lote` varchar(60) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ite_validade` date DEFAULT NULL,
  `ite_qtde` mediumint DEFAULT NULL,
  PRIMARY KEY (`ite_id`),
  KEY `fk_itens_requisicoes` (`ite_req_id`),
  KEY `fk_itens_req_medicamentos` (`ite_med_id`),
  CONSTRAINT `fk_itens_req_medicamentos` FOREIGN KEY (`ite_med_id`) REFERENCES `tb_medicamentos` (`med_id`),
  CONSTRAINT `fk_itens_requisicoes` FOREIGN KEY (`ite_req_id`) REFERENCES `tb_requisicoes` (`req_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela Farmacia';

-- ----------------------------
-- Records of tb_itens_requisicoes
-- ----------------------------
BEGIN;
INSERT INTO `tb_itens_requisicoes` (`ite_id`, `ite_req_id`, `ite_med_id`, `ite_lote`, `ite_validade`, `ite_qtde`) VALUES (1, 1, 3, 'LEAB20M501', '2027-12-30', 5);
INSERT INTO `tb_itens_requisicoes` (`ite_id`, `ite_req_id`, `ite_med_id`, `ite_lote`, `ite_validade`, `ite_qtde`) VALUES (2, 1, 276, 'BET5002AC', '2027-03-29', 5);
INSERT INTO `tb_itens_requisicoes` (`ite_id`, `ite_req_id`, `ite_med_id`, `ite_lote`, `ite_validade`, `ite_qtde`) VALUES (3, 2, 3, 'LEAB20M501', '2027-12-30', 5);
INSERT INTO `tb_itens_requisicoes` (`ite_id`, `ite_req_id`, `ite_med_id`, `ite_lote`, `ite_validade`, `ite_qtde`) VALUES (4, 2, 276, 'BET5002AC', '2027-03-29', 5);
INSERT INTO `tb_itens_requisicoes` (`ite_id`, `ite_req_id`, `ite_med_id`, `ite_lote`, `ite_validade`, `ite_qtde`) VALUES (5, 3, 276, 'BET5002AC', '2027-03-29', 10);
INSERT INTO `tb_itens_requisicoes` (`ite_id`, `ite_req_id`, `ite_med_id`, `ite_lote`, `ite_validade`, `ite_qtde`) VALUES (6, 4, 6, 'TLG5670AX', '2026-12-30', 10);
INSERT INTO `tb_itens_requisicoes` (`ite_id`, `ite_req_id`, `ite_med_id`, `ite_lote`, `ite_validade`, `ite_qtde`) VALUES (7, 5, 6, 'TLG5670AX', '2026-12-30', 10);
INSERT INTO `tb_itens_requisicoes` (`ite_id`, `ite_req_id`, `ite_med_id`, `ite_lote`, `ite_validade`, `ite_qtde`) VALUES (8, 6, 6, 'TLG5670AX', '2026-12-30', 10);
INSERT INTO `tb_itens_requisicoes` (`ite_id`, `ite_req_id`, `ite_med_id`, `ite_lote`, `ite_validade`, `ite_qtde`) VALUES (9, 7, 6, 'TLG5670AX', '2026-12-30', 10);
INSERT INTO `tb_itens_requisicoes` (`ite_id`, `ite_req_id`, `ite_med_id`, `ite_lote`, `ite_validade`, `ite_qtde`) VALUES (10, 8, 6, 'TLG5670AX', '2026-12-30', 5);
INSERT INTO `tb_itens_requisicoes` (`ite_id`, `ite_req_id`, `ite_med_id`, `ite_lote`, `ite_validade`, `ite_qtde`) VALUES (11, 9, 6, 'TLG5670AX', '2026-12-30', 6);
INSERT INTO `tb_itens_requisicoes` (`ite_id`, `ite_req_id`, `ite_med_id`, `ite_lote`, `ite_validade`, `ite_qtde`) VALUES (12, 10, 6, 'TLG5670AX', '2026-12-30', 5);
INSERT INTO `tb_itens_requisicoes` (`ite_id`, `ite_req_id`, `ite_med_id`, `ite_lote`, `ite_validade`, `ite_qtde`) VALUES (13, 11, 6, 'TLG5670AX', '2026-12-30', 5);
INSERT INTO `tb_itens_requisicoes` (`ite_id`, `ite_req_id`, `ite_med_id`, `ite_lote`, `ite_validade`, `ite_qtde`) VALUES (14, 12, 3, 'LEAB20M501', '2027-12-30', 1);
INSERT INTO `tb_itens_requisicoes` (`ite_id`, `ite_req_id`, `ite_med_id`, `ite_lote`, `ite_validade`, `ite_qtde`) VALUES (15, 13, 3, 'LEAB20M501', '2027-12-29', 5);
INSERT INTO `tb_itens_requisicoes` (`ite_id`, `ite_req_id`, `ite_med_id`, `ite_lote`, `ite_validade`, `ite_qtde`) VALUES (16, 14, 3, 'LEAB20M501', '2027-12-29', 5);
INSERT INTO `tb_itens_requisicoes` (`ite_id`, `ite_req_id`, `ite_med_id`, `ite_lote`, `ite_validade`, `ite_qtde`) VALUES (17, 14, 276, 'BET5002AC', '2027-03-28', 5);
INSERT INTO `tb_itens_requisicoes` (`ite_id`, `ite_req_id`, `ite_med_id`, `ite_lote`, `ite_validade`, `ite_qtde`) VALUES (18, 15, 3, 'LEAB20M501', '2027-12-28', 5);
INSERT INTO `tb_itens_requisicoes` (`ite_id`, `ite_req_id`, `ite_med_id`, `ite_lote`, `ite_validade`, `ite_qtde`) VALUES (19, 16, 1, 'DP26310741', '2027-07-30', 2);
INSERT INTO `tb_itens_requisicoes` (`ite_id`, `ite_req_id`, `ite_med_id`, `ite_lote`, `ite_validade`, `ite_qtde`) VALUES (20, 17, 3, 'LE20ABM520', '2027-11-28', 10);
INSERT INTO `tb_itens_requisicoes` (`ite_id`, `ite_req_id`, `ite_med_id`, `ite_lote`, `ite_validade`, `ite_qtde`) VALUES (21, 18, 3, 'LE20ABM520', '2027-11-27', 10);
INSERT INTO `tb_itens_requisicoes` (`ite_id`, `ite_req_id`, `ite_med_id`, `ite_lote`, `ite_validade`, `ite_qtde`) VALUES (22, 19, 3, 'LE20ABM520', '2027-11-28', 10);
COMMIT;

-- ----------------------------
-- Table structure for tb_itens_solicitacoes
-- ----------------------------
DROP TABLE IF EXISTS `tb_itens_solicitacoes`;
CREATE TABLE `tb_itens_solicitacoes` (
  `iso_id` int NOT NULL,
  `iso_sol_id` int DEFAULT NULL,
  `iso_med_id` int DEFAULT NULL,
  `iso_med_lote` varchar(60) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `iso_med_validade` date DEFAULT NULL,
  `iso_med_qtde` mediumint DEFAULT NULL,
  `iso_qtde_digitada` mediumint DEFAULT NULL,
  PRIMARY KEY (`iso_id`),
  KEY `fk_itens_sol_solicitacoes` (`iso_sol_id`),
  KEY `fk_itens_sol_medicamentos` (`iso_med_id`),
  CONSTRAINT `fk_itens_sol_medicamentos` FOREIGN KEY (`iso_med_id`) REFERENCES `tb_medicamentos` (`med_id`),
  CONSTRAINT `fk_itens_sol_solicitacoes` FOREIGN KEY (`iso_sol_id`) REFERENCES `tb_solicitacoes` (`sol_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela Farmacia';

-- ----------------------------
-- Records of tb_itens_solicitacoes
-- ----------------------------
BEGIN;
INSERT INTO `tb_itens_solicitacoes` (`iso_id`, `iso_sol_id`, `iso_med_id`, `iso_med_lote`, `iso_med_validade`, `iso_med_qtde`, `iso_qtde_digitada`) VALUES (1, 1, 3, 'LE20ABM520', '2027-11-28', 10, 10);
INSERT INTO `tb_itens_solicitacoes` (`iso_id`, `iso_sol_id`, `iso_med_id`, `iso_med_lote`, `iso_med_validade`, `iso_med_qtde`, `iso_qtde_digitada`) VALUES (2, 1, 3, 'LEAB20M501', '2027-12-28', 5, 5);
INSERT INTO `tb_itens_solicitacoes` (`iso_id`, `iso_sol_id`, `iso_med_id`, `iso_med_lote`, `iso_med_validade`, `iso_med_qtde`, `iso_qtde_digitada`) VALUES (3, 2, 3, 'LEAB20M501', '2027-12-30', 20, 20);
INSERT INTO `tb_itens_solicitacoes` (`iso_id`, `iso_sol_id`, `iso_med_id`, `iso_med_lote`, `iso_med_validade`, `iso_med_qtde`, `iso_qtde_digitada`) VALUES (4, 3, 3, 'LE20ABM520', '2027-11-27', 10, NULL);
COMMIT;

-- ----------------------------
-- Table structure for tb_locais
-- ----------------------------
DROP TABLE IF EXISTS `tb_locais`;
CREATE TABLE `tb_locais` (
  `local_id` mediumint NOT NULL,
  `local_descr` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `local_ativo` tinyint DEFAULT NULL,
  `local_tipo` varchar(3) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`local_id`) USING BTREE,
  FULLTEXT KEY `search_local_desc r` (`local_descr`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela Farmacia';

-- ----------------------------
-- Records of tb_locais
-- ----------------------------
BEGIN;
INSERT INTO `tb_locais` (`local_id`, `local_descr`, `local_ativo`, `local_tipo`) VALUES (1, 'AMBULATORIO HEMOSE', 1, 'INT');
INSERT INTO `tb_locais` (`local_id`, `local_descr`, `local_ativo`, `local_tipo`) VALUES (2, 'HOSPITAL DE URGENCIA DE SERGIPE (HUSE)', 1, 'EXT');
INSERT INTO `tb_locais` (`local_id`, `local_descr`, `local_ativo`, `local_tipo`) VALUES (3, 'HOSPITAL CIRURGIA', 1, 'EXT');
INSERT INTO `tb_locais` (`local_id`, `local_descr`, `local_ativo`, `local_tipo`) VALUES (4, 'HOSPITAL SÃO LUCAS', 1, 'EXT');
INSERT INTO `tb_locais` (`local_id`, `local_descr`, `local_ativo`, `local_tipo`) VALUES (5, 'DOSE DOMICILIAR DE URGENCIA (DDU)', 1, 'EXT');
INSERT INTO `tb_locais` (`local_id`, `local_descr`, `local_ativo`, `local_tipo`) VALUES (6, 'PROFILAXIA SECUNDARIA', 0, 'INT');
COMMIT;

-- ----------------------------
-- Table structure for tb_medicamentos
-- ----------------------------
DROP TABLE IF EXISTS `tb_medicamentos`;
CREATE TABLE `tb_medicamentos` (
  `med_id` int NOT NULL,
  `med_descr` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `med_descr_coml` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `med_und` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `med_tipo_codigo` varchar(3) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `med_tipo_med` varchar(90) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `med_max` smallint DEFAULT NULL,
  `med_min` smallint DEFAULT NULL,
  `med_ui_cx` mediumint DEFAULT NULL,
  `med_bona_codigo` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `med_alert` smallint DEFAULT NULL,
  `med_diag_id` int DEFAULT NULL,
  `med_ativo` tinyint DEFAULT NULL,
  `med_codigo` varchar(8) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`med_id`),
  UNIQUE KEY `idx_med_codigo` (`med_codigo`) USING BTREE,
  KEY `fk_medicamentos_tipos` (`med_tipo_codigo`),
  KEY `fk_medicamentos_boname` (`med_bona_codigo`),
  KEY `fk_medicamentos_diag` (`med_diag_id`),
  FULLTEXT KEY `search_medicamentos` (`med_descr`,`med_descr_coml`),
  CONSTRAINT `fk_medicamentos_boname` FOREIGN KEY (`med_bona_codigo`) REFERENCES `tb_boname` (`bona_codigo`),
  CONSTRAINT `fk_medicamentos_diag` FOREIGN KEY (`med_diag_id`) REFERENCES `tb_diagnosticos` (`diag_id`),
  CONSTRAINT `fk_medicamentos_tipos` FOREIGN KEY (`med_tipo_codigo`) REFERENCES `tb_tipos_medicamentos` (`tipo_codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela Farmacia';

-- ----------------------------
-- Records of tb_medicamentos
-- ----------------------------
BEGIN;
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (1, 'DIPIRONA SODICA 1G', 'NOVALGINA', 'COMP', 'MD', 'NÃO CONTROLADO', 100, 10, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (2, 'LOSARTANA 100MG', 'LOSARTANA', 'COMP', 'MD', 'NÃO CONTROLADO', 100, 25, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (3, 'FATOR VIII 500UI', 'HEMOBRAS', 'KIT', 'FT', 'CONTROLADO', 300, 50, 500, 'VIII500', 90, 1, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (4, 'SORO FISIOLOGICO 500ML', 'GLIFARMA', 'BOLSA', 'MT', 'NÃO CONTROLADO', 50, 5, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (5, 'IMIGLUCERACE', 'IMIGLUCERACE', 'UN', 'DE', 'CONTROLADO', 30, 5, 0, NULL, 35, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (6, 'TALIGLUCERACE', 'TALIGLUCERACE', 'UN', 'DE', 'CONTROLADO', 30, 10, 0, NULL, 35, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (218, 'SONDA NASOGASTRICA CURTA NR 16', '', 'und', 'MT', NULL, 20, 5, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (219, 'SONDA NASOGASTRICA CURTA NR 20', '', 'und', 'MT', NULL, 20, 5, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (220, 'ATADURA CREPE', 'CREPE', 'rolo', 'MT', NULL, 20, 5, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (221, 'SONDA DE ASPIRAÇÃO NR 10', 'SONDA DE ASPIRAÇÃO', 'und', 'MT', NULL, 20, 5, 0, NULL, 0, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (222, 'SONDA DE FOLEY NR 12', 'BD', 'und', 'MT', NULL, 20, 5, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (223, 'TUBO TRAQUEAL NR 4,0', 'TUBO TRAQUEAL', 'und', 'MT', NULL, 20, 5, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (224, 'TUBO TRAQUEAL NR 5,0', 'TUBO TRAQUEAL', 'und', 'MT', NULL, 20, 5, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (225, 'TUBO TRAQUEAL NR 6,0', 'TUBO TRAQUEAL', 'und', 'MT', NULL, 20, 5, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (226, 'TUBO TRAQUEAL NR 6,5', 'TUBO TRAQUEAL', 'und', 'MT', NULL, 20, 5, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (227, 'TUBO TRAQUEAL NR 7,5', 'TUBO TRAQUEAL', 'und', 'MT', NULL, 20, 5, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (228, 'TUBO TRAQUEAL NR 8,0', 'TUBO TRAQUEAL', 'und', 'MT', NULL, 20, 5, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (229, 'TUBO TRAQUEAL NR 8,5', 'TUBO TRAQUEAL', 'und', 'MT', NULL, 20, 5, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (230, 'TUBO TRAQUEAL NR 9,0', 'TUBO TRAQUEAL', 'und', 'MT', NULL, 20, 5, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (231, 'COLETOR DE URINA SIST FECHADO', 'BD', 'und', 'MT', NULL, 20, 5, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (232, 'AMBU COMPLETO ADULTO', 'AMBU', 'und', 'MT', NULL, 2, 1, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (233, 'AMBU COMPLETO INFANTIL', 'AMBU', 'und', 'MT', NULL, 2, 1, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (234, 'AMBU COMPLETO NEONATAL', 'AMBU', 'und', 'MT', NULL, 2, 1, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (235, 'GUEDEL NR 1', 'GUEDEL', 'und', 'MT', NULL, 2, 1, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (236, 'GUEDEL NR 2', 'GUEDEL', 'und', 'MT', NULL, 2, 1, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (237, 'GUEDEL NR 3', 'GUEDEL', 'und', 'MT', NULL, 2, 1, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (238, 'GUEDEL NR 4', 'GUEDEL', 'und', 'MT', NULL, 2, 1, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (239, 'GUEDEL NR 5', 'GUEDEL', 'und', 'MT', NULL, 2, 1, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (240, 'GUEDEL NR 6', 'GUEDEL', 'und', 'MT', NULL, 2, 1, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (241, 'GUEDEL NR 7', 'GUEDEL', 'und', 'MT', NULL, 2, 1, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (242, 'GUEDEL NR 8', 'GUEDEL', 'und', 'MT', NULL, 2, 1, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (243, 'GUEDEL NR 9', 'GUEDEL', 'und', 'MT', NULL, 2, 1, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (244, 'UMIDIFICADOR', 'UMIDIFICADOR', 'und', 'MT', NULL, 2, 1, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (245, 'FRASCO DE ASPIRAÇÃO', 'FRASCO DE ASPIRAÇÃO', 'und', 'MT', NULL, 2, 1, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (248, 'TUBO DE LATEX', 'IDEATEX', 'un', 'MT', NULL, 0, 0, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (249, 'SERINGA HIPODERMICA 10ML SEM AGULHA', 'BBRAUN', 'und', 'MT', NULL, 0, 0, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (250, 'ESCALPE INTRAVENOSO 23G', 'HOSPIRA', 'und', 'MT', NULL, 0, 0, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (251, 'CANULA 16G PARA ASPIRACAO DE MEDULA', 'BIOMEDICAL', 'un', 'MT', NULL, 48, 10, 0, NULL, 120, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (252, 'CANULA 18G PARA ASPIRACAO DE MEDULA', 'BIOMEDICAL', 'un', 'MT', NULL, 48, 10, 0, NULL, 120, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (253, 'SERINGA HIPODERMICA 5ML COM AGULHA', 'DESCARPACK', 'un', 'MT', NULL, 200, 10, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (254, 'TOUCA DESCARTÁVEL', 'DESCARPACK', 'un', 'MT', NULL, 100, 5, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (255, 'ESCALPE INTRAVENOSO 23 G', 'BBRAUM', 'un', 'MT', NULL, 100, 10, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (256, 'SERINGA HIPODERMICA 3ML SEM AGULHA', 'BBRAUM ', 'un', 'MT', NULL, 1000, 10, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (257, 'SERINGA HIPODERMICA 5ML SEM AGULHA', 'BBRAUM', 'un', 'MT', NULL, 100, 10, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (258, 'FATOR VIII 250 UI', 'CSL', 'UI', 'FT', 'CONTROLADO', 200, 50, 250, 'VIII250', 180, 1, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (259, 'FATOR VIII 500 UI', 'CSL', 'UI', 'FT', 'CONTROLADO', 200, 50, 500, 'VIII500', 180, 1, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (260, 'MIGLUSTATE 100MG', '', 'COMP', 'FT', NULL, 0, 0, 100, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (261, 'DICLOFENACO DIETILAMÔNIO 11,6 MG/G  GEL', 'DICLOFENACO', 'bisn', 'MD', NULL, 5, 2, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (262, 'BANDAGEM ADESIVA HIPO-ALERGICA', 'CURATIVO', '', 'MT', NULL, 500, 100, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (263, 'CATETER INTRAVENOSO 20G', 'SOLIDOR', 'und', 'MT', NULL, 200, 50, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (264, 'EXTENSOR PARA EQUIPO 400MM', 'EXTENSOR', 'und', 'MT', NULL, 10, 5, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (265, 'EQUIPO MACROGOTAS', 'MEDEQUIPO', 'und', 'MT', NULL, 10, 5, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (266, 'EXTENSOR 02 VIAS', 'COMPO JET', 'und', 'MT', NULL, 20, 5, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (267, 'CATETER INTRAVENOSO 22 G', 'DESCARPACK ', 'un', 'MT', NULL, 150, 50, 0, NULL, 120, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (268, 'FATOR VIIIY 500 UI', 'BPL', 'UI', 'FT', NULL, 100, 50, 500, NULL, 180, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (269, 'CAPTOPRIL 25MG', 'CAPTOMED', 'comp', 'MD', NULL, 200, 50, 0, NULL, 120, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (270, 'LACRE', 'LACRE', 'un', 'MT', NULL, 100, 5, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (271, 'ACETATO DE DESMOPRESSINA 15 MCG/ML', 'DDAVP 15 MCG/ML', 'Amp', 'FT', NULL, 50, 10, 1, NULL, 120, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (272, 'AGULHA HIPODERMICA 13X0,45', 'DESCARPACK', '', 'MT', NULL, 20, 5, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (273, 'AGULHA HIPODERMICA 40 X 12 18G', 'BD', 'un', 'MT', NULL, 200, 20, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (274, 'FRALDA DESCARTAVEL ADULTO TAM G', 'CONFORTEX', 'un', 'MT', NULL, 25, 5, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (275, 'FRALDA DESCARTAVEL ADULTO TAM M', 'CONFORTEX', 'und', 'MT', NULL, 25, 5, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (276, 'FATOR IX 500 UI', 'BETAFACT- CSL', 'UI', 'FT', NULL, 150, 30, 500, NULL, 180, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (277, 'FUROSEMIDA 10MG/ML', 'TEUTO', 'amp', 'MD', NULL, 100, 20, 0, NULL, 120, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (278, 'SOLUCAO GLICOFISIOLOGICA 500ML', 'KABIPAC', 'un', 'MT', NULL, 30, 5, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (279, 'DIMENIDRINATO 50MG/ML I.M.', 'NYCOMED', 'AMP', 'MD', NULL, 100, 10, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (280, 'LAMINA PARA MICROSCOPIA ', 'SOLIDOR', 'und', 'MT', NULL, 100, 50, 0, NULL, 35, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (281, 'SERINGA HIPODERMICA 20ML C/ AGULHA', 'SR  ', 'und', 'MT', NULL, 200, 10, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (283, 'BOLSA SIMPLES CPDA1', 'TERUMO ', 'un', 'MT', NULL, 100, 10, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (284, 'CLOREXIDINA SOLUÇÃO ALCOOLICA 5%', 'VICFARMA', 'litro', 'MD', NULL, 2, 1, 0, NULL, 35, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (285, 'LUVA ESTERIL TAM 8.0', 'NEW HAND', 'und', 'MT', NULL, 8, 2, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (286, 'BOLSA TRIPLA CPDA-1', 'TERUMO ', 'un', 'MT', NULL, 84, 5, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (287, 'LUVA DE PROCEDIMENTO TAM M', 'HANDCARE', 'un', 'MT', NULL, 10, 2, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (288, 'ESCALPE 21G', 'BD', 'un', 'MT', NULL, 500, 10, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (289, 'FUROSEMIDA 10MG/ML', 'HYPOFARMA', 'un', 'MD', NULL, 100, 10, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (290, 'CATETER INTRAVENOSO 22G', 'BD ANGIOCATH ', 'un', 'MT', NULL, 150, 20, 0, NULL, 45, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (291, 'AGUA DESTILADA 10ML', 'FARMACE', 'und', 'MT', NULL, 400, 10, 0, NULL, 120, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (292, 'FENOTEROL (BROMIDRATO) 5MG/ML', 'TEUTO', 'UND', 'MD', NULL, 10, 1, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (293, 'IPRATROPIO (BROMETO) 0,25MG/ML', 'IPRATROPIO (BROMETO) 0,25MG/ML', 'FRASCO', 'MD', NULL, 5, 0, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (294, 'CATETER INTRAVENOSO 20G', 'INJEX-CATH', 'un', 'MT', NULL, 50, 20, 0, NULL, 35, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (295, 'CATETER INTRAVENOSO 24G', 'INJEX- CATH', '', 'MT', NULL, 50, 20, 0, NULL, 35, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (296, 'SERINGA HIPODERMICA 3ML C/ AGULHA', 'DESCARPACK', 'un', 'MT', NULL, 100, 20, 0, NULL, 35, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (297, 'SERINGA HIPODERMICA 20ML C/ AGULHA ', 'INJEX', 'un', 'MT', NULL, 100, 20, 0, NULL, 35, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (298, 'CATETER INTRAVENOSO 22G', 'INJEX-CATH', 'un', 'MT', NULL, 50, 20, 0, NULL, 0, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (299, 'FEIBA 2500 UI  ', 'FEIBA ', 'UI', 'FT', NULL, 100, 20, 2500, NULL, 180, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (300, 'FATOR VIII 250 UI RECOMBINANTE', 'HEMOBRAS', 'UI', 'FT', 'CONTROLADO', 100, 20, 250, 'VIII250R', 180, 1, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (301, 'FATOR VIII 500 UI RECOMBINANTE', 'HEMOBRAS', 'UI', 'FT', NULL, 100, 20, 500, NULL, 180, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (302, 'FILTRO HEMILISADOR', 'BIOMETRIX', 'un', 'MT', NULL, 2, 1, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (303, 'SONDA DE FOLEY Nº14', 'SOLIDOR', '4', 'MT', NULL, 6, 1, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (304, 'TUBO ENDOTRAQUEAL Nº8', 'SOLIDOR', '1', 'MT', NULL, 0, 0, 0, NULL, 0, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (305, 'TUBO ENDOTRAQUEAL Nº9', 'MEDTRAQUEAL', '', 'MT', NULL, 4, 1, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (306, 'TUBO ENDOTRAQUEAL Nº8,5', 'MEDTRAQUEAL', 'un', 'MT', NULL, 2, 1, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (307, 'TUBO ENDOTRAQUEAL Nº3,5', 'SOLIDOR', 'un', 'MT', NULL, 2, 1, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (308, 'TUBO ENDOTRAQUEAL Nº6', 'SOLIDOR', 'un', 'MT', NULL, 2, 1, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (309, 'TUBO ENDOTRAQUEAL Nº4,5', 'SOLIDOR', 'un', 'MT', NULL, 2, 1, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (310, 'TUBO ENDOTRAQUEAL Nº7', 'SOLIDOR', 'un', 'MT', NULL, 2, 1, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (311, 'TUBO ENDOTRAQUEAL Nº5', 'SOLIDOR', 'un', 'MT', NULL, 2, 1, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (312, 'SERINGA HIPODERMICA 5ML COM AGULHA', 'INJEX', 'un', 'MT', NULL, 90, 30, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (313, 'MASCARA DE VENTURE ADULTO', 'SMITHS MEDICAL', 'un', 'MT', NULL, 5, 1, 0, NULL, 120, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (314, 'MASCARA DE VENTURE INFANTIL', 'SMITHS MEDICAL', 'un', 'MT', NULL, 5, 1, 0, NULL, 120, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (315, 'OXIMETRO DE PULSO', 'BEIJING CHOICE', 'un', 'MT', NULL, 5, 1, 0, NULL, 0, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (316, 'VALVULA REGULADORA P OXIGENIO', 'MILEC', 'un', 'MT', NULL, 5, 1, 0, NULL, 0, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (317, 'KIT CANULAS GUEDEL N 1 A N 6', 'OXIGEL', 'un', 'MT', NULL, 5, 1, 0, NULL, 0, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (318, 'SONDA DE ASPIRACAO TRAQUEAL N6', 'MARKMED', 'un', 'MT', NULL, 10, 1, 0, NULL, 120, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (319, 'SONDA DE ASPIRACAO TRAQUEAL N14', 'MARKMED', 'un', 'MT', NULL, 10, 1, 0, NULL, 120, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (320, 'SONDA DE ASPIRACAO TRAQUEAL N12', 'MARKMED', 'un', 'MT', NULL, 5, 1, 0, NULL, 120, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (321, 'CATETER NASAL P O2 N 6', 'MARKMED', 'un', 'MT', NULL, 5, 1, 0, NULL, 120, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (322, 'FATOR VIII 1000 UI RECOMBINANTE', 'HEMOBRAS', 'UI', 'FT', NULL, 100, 10, 1000, NULL, 180, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (323, 'AGULHA 25X0,70', 'INJEX', 'un', 'MT', NULL, 100, 30, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (324, 'AGULHA 40X1,2', 'INJEX', 'un', 'MT', NULL, 90, 30, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (325, 'ESCALPE INTRAVENOSO 21G', 'LAMEDID', 'un', 'MT', NULL, 30, 10, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (326, 'CAPTOPRIL', 'BALM-LABOR', 'un', 'MD', NULL, 0, 30, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (327, 'CLORIDRATO DE DOPAMINA', 'HIPOLABOR', 'un', 'MD', NULL, 0, 30, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (328, 'DIAZEPAM', 'TEUTO', 'un', 'MD', NULL, 0, 30, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (329, 'DICLOFENACO DIETILAMONIO', 'FARMAFLAN', 'gel', 'MD', NULL, 0, 1, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (330, 'MALEATO DE DEXCLOFENIRAMINA', 'HYSTIN', 'comp', 'MD', NULL, 0, 30, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (331, 'MALEATO DE DEXCLOFENIRAMINA', 'EMS', 'frasco', 'MD', NULL, 0, 1, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (332, 'LIDOCAÍNA 2% GELEIA', 'LABCAINA', 'BISN', 'MD', NULL, 0, 1, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (333, 'LIDOCAINA', 'LABCAINA', 'BISN', 'MD', NULL, 0, 1, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (334, 'CLORIDRATO DE PROPRANOLOL 40MG', 'POLOL', 'comp', 'MD', NULL, 0, 30, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (335, 'DIMENIDRINATO 100MG', 'DRAMIN', 'comp', 'MD', NULL, 50, 5, 0, NULL, 120, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (336, 'HIDROCLOROTIAZIDA 25 MG', 'HIDROLESS', 'COMP', 'MD', NULL, 90, 30, 0, NULL, 0, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (337, 'FATOR VIIIY 500 UI', 'GRIFOLS ', 'UI', 'FT', NULL, 500, 15, 500, NULL, 180, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (338, 'SORO FISIOLOGICO BOLSA 250 ML', 'BBRAUN', 'un', 'MT', NULL, 30, 10, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (339, 'SORO FISIOLOGICO BOLSA 250 ML', 'FRESENIUS', 'UN', 'MT', NULL, 0, 30, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (340, 'FATOR VIIIY 500 UI', '', 'UI', 'FT', NULL, 0, 30, 500, NULL, 180, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (341, 'DIPIRONA SODICA AMPOLA 2ML', 'TEUTO', 'UN', 'MD', NULL, 90, 30, 0, NULL, 0, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (342, 'FUROSEMIDA 10MG/ML', 'SANTISA', 'un', 'MD', NULL, 90, 30, 0, NULL, 0, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (343, 'NALOXONA CLORIDRATO 0,4MG/ML', 'NALOXONA', 'un', 'MD', NULL, 90, 30, 0, NULL, 0, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (344, 'DIPIRONA SODICA 500MG/ML GOTAS', 'MAXALGINA', 'un', 'MD', NULL, 90, 30, 0, NULL, 0, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (345, 'IBUPROFENO 300MG', 'ALGY-FLANDERIL', 'UN', 'MD', NULL, 90, 10, 0, NULL, 0, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (346, 'FATOR IX 250 UI', 'GRIFOLS', 'UI', 'FT', NULL, 500, 25, 250, NULL, 180, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (347, 'FATOR IX 500 UI', 'GRIFOLS', 'UI', 'FT', NULL, 500, 25, 500, NULL, 180, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (348, 'SIMETICONA GTS', 'HIPOLABOR', 'un', 'MD', NULL, 2, 1, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (349, 'SORO FISIOLÓGICO 250 ML', 'FARMACE', 'UN', 'MT', NULL, 30, 10, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (350, 'DIMENIDRINATO 25MG/ML PIRIDOXINA 5MG/ML GOTAS', 'DRAMIN B6', 'FRASCO', 'MD', NULL, 0, 0, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (351, 'NIFEDIPINO 10 MG', 'NIFEDIPINO', 'COMPR', 'MD', NULL, 30, 10, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (352, 'COMPLEXO PROTROMBINICO 500 UI', '', 'UI', 'FT', NULL, 50, 10, 500, NULL, 180, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (353, 'FITOMENADIONA VITAMINA K', 'VIT K', 'ampola', 'MD', NULL, 0, 0, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (354, 'BESILATO ANLODIPINO', 'ANLODIPINO', 'COMP', 'MD', NULL, 20, 10, 0, NULL, 35, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (355, 'FATOR IX 1000UI', 'OCTAFARMA', 'UI', 'FT', NULL, 50, 10, 1000, NULL, 180, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (356, 'AGUA DESTILADA 500ML', 'HALEXISTAR', 'UN', 'MT', NULL, 0, 0, 0, NULL, 0, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (357, 'GLICOSE 5% 250ML', 'GLICOSE 5%', 'FRASCO', 'MT', NULL, 10, 5, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (358, 'HIDROCORTISONA 100 MG', 'CORTISONAL', 'UND', 'MD', NULL, 90, 30, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (359, 'CLORIDRATO DE PROMETAZINA 25MG', 'PAMERGAN', 'compr', 'MD', NULL, 50, 5, 0, NULL, 0, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (360, 'SORO FISIOLOGICO 0,9% 100ML', 'SORO FISIOLOGICO', 'FRASCO', 'MT', NULL, 100, 10, 0, NULL, 60, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (361, 'CLORIDRATO DE RANITIDINA 25MG/ML', 'RANITIDINA', 'amp', 'MD', NULL, 10, 5, 0, NULL, 0, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (362, 'BROMOPRIDA', 'BROMOPRIDA', 'amp', 'MD', NULL, 50, 5, 0, NULL, 0, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (363, 'IBUPROFENO 400MG', 'IBUPROFENO0', 'UND', 'MD', NULL, 90, 10, 0, NULL, 10, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (364, 'IBUPROFENO GOTAS 50MG/ML', 'IBUPROFENO', 'UND', 'MD', NULL, 0, 1, 0, NULL, 3, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (365, 'CAPTOPRIL 12,5 MG', 'MARIOL', 'UN', 'MD', NULL, 0, 30, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (366, 'AGUA DESTILADA 20ML', 'AGUA PARA INJEÇÃO', 'UN', 'MT', NULL, 0, 30, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (367, 'FATOR IX 1000UI', 'GRIFOLS', 'UI', 'FT', NULL, 500, 20, 1000, NULL, 180, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (368, 'AGUA PARA INJEÇAO 250ML', 'AGUA PARA INJEÇAO', 'FRASCO', 'MT', NULL, 0, 0, 0, NULL, 0, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (370, 'FATOR VIIIY  1.200 UI', 'CSL', 'UI', 'FT', NULL, 90, 30, 1200, NULL, 180, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (371, 'SORO FISIOLÓGICO 250 ML', 'EUROFARMA', 'un', 'MT', NULL, 90, 30, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (372, 'FATOR VIIIY 1000 UI', 'GRIFOLS', 'UI', 'FT', NULL, 100, 20, 1000, NULL, 180, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (373, 'FATOR VIIIY 500 UI PARA IMUNOTOLERANCIA', 'OCTAPHARMA', 'UI', 'FT', NULL, 100, 20, 500, NULL, 180, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (374, 'FATOR VIIIY 250 UI PARA IMUNOTOLERANCIA', 'OCTAPHARMA', 'UI', 'FT', NULL, 100, 20, 250, NULL, 180, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (375, 'FATOR VIIIY 1000 UI PARA IMUNOTOLERANCIA', 'OCTAPHARMA', 'UI', 'FT', NULL, 100, 20, 1000, NULL, 180, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (376, 'SORO FISIOLOGICO 50ML', 'SORO FISIOLOGICO', 'FRASCO', 'MT', NULL, 100, 10, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (377, 'HIDROCORTISONA 100MG', 'GLIOCORT', 'UND', 'MD', NULL, 90, 30, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (378, 'AGUA DESTILADA 10 ML', 'SAMTEC', 'und', 'MT', NULL, 0, 30, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (379, 'FATOR VIIIY  2.400UI', 'CSL - HAEMATE', 'UI', 'FT', NULL, 0, 30, 2400, NULL, 180, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (380, 'FATOR XIII 250 UI', 'CSL', 'UI', 'FT', NULL, 0, 10, 250, NULL, 180, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (381, 'FATOR VII 100 KUI RECOMBINANTE', 'NOVOSEVEN', 'KUI', 'FT', NULL, 30, 10, 100000, NULL, 180, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (382, 'FATOR VII 250 KUI RECOMBINANTE', 'NOVOSEVEN', 'KUI', 'FT', NULL, 30, 10, 250000, NULL, 180, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (383, 'FATOR VII 50 KUI RECOMBINANTE', 'NOVOSEVEN', 'KUI', 'FT', NULL, 30, 10, 50000, NULL, 180, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (384, 'CLORIDRATO DE ONDANSETRONA', '2MG/ML', 'AMP 2ML', 'MD', NULL, 0, 30, 0, NULL, 60, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (385, 'teste', 'teste', 'amp', NULL, NULL, 50, 5, 0, NULL, 15, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (386, 'teste', 'teset', NULL, NULL, NULL, 0, 0, 0, NULL, 0, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (387, '', '', 'KITO', NULL, NULL, 15, 5, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (388, 'COMPLEXO B POLIVITAMINICO', 'POLIVITAMINICO', 'AMPOLA', 'MD', NULL, 20, 0, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (390, 'LOSARTANA POTÁSSICA 50MG', 'LOSARTANA', 'COMP', 'MD', NULL, 60, 30, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (391, 'HISOCEL 500ML', 'HISOCEL', 'BOLSA', 'MT', NULL, 5, 1, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (392, 'AC FOLICO 400 MCG + DEXTROALFATOCOFEROL 10 MG', 'DTN - FOL', 'CÁPSULA', 'MD', NULL, 60, 0, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (393, 'SUPL FERRO + AC FÓLICO', 'HEMO FOLIC', 'CÁPSULA', 'MD', NULL, 60, 0, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (394, 'AC FÓLICO 5MG + BISGLICINATO FERROSO 150 MG', 'FOLIFER', 'COMP', 'MD', NULL, 60, 0, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (395, 'SUPL AC FOLICO', '4G FOLIC', 'CÁPSULA', 'MD', NULL, 60, 0, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (396, 'AC FÓLICO 5MG', 'FEMME FOLICO', 'COMP', 'MD', NULL, 60, 0, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (397, 'FUROSEMIDA 40MG', 'FUROSEMIDA', 'COMP', 'MD', NULL, 60, 0, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (398, 'FERRO BISGLICINATO QUELATO', 'AMOSTRA GRATIS', 'COMP', 'MD', NULL, 20, 5, 0, NULL, 60, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (399, 'BISGLICINATO FERROSO PRO', 'AMOSTRA GRATIS', 'CAP', 'MD', NULL, 20, 4, 0, NULL, 60, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (400, 'OLMESARTANA 40MG + ANLODIPINO 5MG', 'OLMESARTANA + ANLODIPINO', 'COMPR', 'MD', NULL, 10, 5, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (401, 'LANSOPRAZOL 30MG', 'LANSOPRAZOL', 'COMPR', 'MD', NULL, 10, 5, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (402, 'NIFEDIPINO 20 MG', 'NIFEDIPINO', 'COMPR', 'MD', NULL, 10, 5, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (403, 'DIMENIDRINATO 3MG/ML E.V.', 'DRAMIN E.V.', 'AMP', 'MD', NULL, 30, 5, 0, NULL, 180, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (404, 'DEXCLOFENIRAMINA 0,4MG/ML', '', 'FRASCO', 'MD', NULL, 100, 0, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (405, 'CETOPROFENO 100MG / IV', '', 'FRASCO', 'MD', NULL, 100, 0, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (406, 'CETOPROFENO 50 MG / IM', '', 'AMPOLA', 'MD', NULL, 100, 0, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (407, 'CLORIDRATO DE ONDANSETRONA 8MG', '8MG', '20', 'MD', NULL, 0, 0, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (408, 'EMICIZUMABE 30MG/ML', 'HEMCIBRA 30MG/ML', 'MG', 'FT', NULL, 100, 0, 30, NULL, 180, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (409, 'FATOR IX 1200UI', 'IMMUNINE', 'UI', 'FT', NULL, 0, 0, 1200, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (410, 'FATOR VIII-A-IT 1000 UI', 'ALPHANATE', 'UI', 'FT', NULL, 500, 0, 1000, NULL, 180, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (411, 'FATOR VIII-A-IT 250 UI', 'ALPHANATE', 'UI', 'FT', NULL, 500, 0, 250, NULL, 180, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (412, 'FATOR VIII-A-IT 500 UI', 'ALPHANATE', 'UI', 'FT', NULL, 500, 0, 500, NULL, 180, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (413, 'ENALAPRIL 5MG', 'RENALAPRIL', '20', 'FT', NULL, 100, 0, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (414, 'ECULIZUMAB 300MG (SOLIRIS)', 'SOLIRIS', '300MG', 'FT', NULL, 200, 3, 300, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (415, 'ENALAPRIL 10 MG', '10 MG', '10MG', 'MD', NULL, 90, 10, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (416, 'FATOR VIII 1500UI RECOMBINANTE', 'HEMOBRAS', 'UI', 'FT', NULL, 500, 30, 1500, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (417, 'CLORIDRATO DE TRAMADOL 100MG/2ML', 'TRAMADOL', 'UNID', 'MD', NULL, 90, 30, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (418, 'CLORIDRATO DE METOCLOPRAMIDA 5MG/ML', 'METROFARMA', 'UND', 'MD', NULL, 90, 30, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (419, 'FATOR VIII-A-IT 1000UI', 'IMMUNATE - BAXALTA', 'UI', 'FT', NULL, 500, 30, 1000, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (420, 'FATOR VIII-A-IT 250UI', 'IMMUNATE - BAXALTA', 'UI', 'FT', NULL, 5000, 30, 250, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (421, 'FATOR VIII-A-IT 500UI', 'IMMUNATE - BAXALTA', 'UI', 'FT', NULL, 5000, 30, 500, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (422, 'PARACETAMOL 750MG', 'PARAMOL', 'COMP', 'MD', NULL, 40, 10, 0, NULL, 90, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (423, 'IBUPROFENO 600MG', 'IBUPROFENO', 'COMP', 'MD', NULL, 100, 30, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (424, 'FATOR VIIIY 250 UI', 'GRIFOLS', 'UI', 'FT', NULL, 300, 30, 250, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (425, 'ALFAVELAGLICERASE 400UI', 'VPRIV', '400', 'DE', NULL, 30, 0, 0, NULL, 120, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (426, 'LORATADINA 1MG/ML', 'LORATADINA', 'FRASCO', 'MD', NULL, 0, 0, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (427, 'ISOSSORBIDA 10MG', '', 'COMP', 'MD', NULL, 0, 0, 0, NULL, 120, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (428, 'FATOR VIII-A-IT 500 UI', 'OCTAPHARMA', 'UI', 'FT', NULL, 300, 0, 500, NULL, 120, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (429, 'HIDRALAZINA . CLORIDRATO 20MG/ML', 'NEPRESOL', '30', 'MD', NULL, 30, 10, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (430, 'CLORIDRATO DE ONDANSETRONA 2MG/ML', 'VONAU', 'AMP 4ML', 'MD', NULL, 100, 0, 0, NULL, 120, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (431, 'OMEPRAZOL 20MG', 'OMEPRAZOL', 'UN', 'MD', NULL, 30, 10, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (432, 'LORATADINA 10 MG', 'LORASLIV', 'COMP', 'MD', NULL, 100, 0, 0, NULL, 120, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (433, 'DICLORIDRATO DE MECLOZINA 25 MG', 'MECLIN JET', 'COMP', 'MD', NULL, 100, 0, 0, NULL, 120, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (434, 'EMICIZUMABE 60MG/0,4ML', 'HEMCIBRA', 'MG', 'FT', NULL, 120, 0, 60, NULL, 120, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (435, 'FATOR IX 500UI', 'HEMOBRÁS', 'UI', 'FT', NULL, 0, 0, 500, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (436, 'FATOR VIII 500UI', 'HEMOBRÁS (OCTO- TEC INFORMÁTICA LTDA)', 'UI', 'FT', NULL, 0, 0, 500, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (437, 'MORFINA, SULFATO 10MG', 'DIMORF', 'COMP', 'MD', NULL, 50, 0, 0, NULL, 120, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (438, 'ETOMIDATO 2MG/ML', 'ETOMIDATO', 'AMP', 'MD', NULL, 10, 0, 0, NULL, 120, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (439, 'PREDNISOLONA, FOSFATO SODICO 3MG/ML', 'PREDNISOLONA XAROPE', 'FR', 'MD', NULL, 300, 0, 0, NULL, 120, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (440, 'PREDNISOLONA, FOSFATO SODICO 11 MG/ML', 'PREDNISOLONA GOTAS', 'FR', 'MD', NULL, 300, 0, 0, NULL, 120, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (441, 'SALBUTAMOL 100MCG/DOSE', 'AEROFRIN SPRAY', 'MCG', 'MD', NULL, 30, 1, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (442, 'EPINEFRINA (ADRENALINA)1MG/ML', 'HYFREN', 'UND', 'MD', NULL, 90, 30, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (443, 'LIDOCAÍNA GEL 2% (20MG/G)', 'LABCAÍNA', 'UND', 'MD', NULL, 30, 3, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (444, 'NITROPRUSSETO DE SÓDIO 25MG/ML', 'NITROP', 'UND', 'MD', NULL, 90, 30, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (445, 'LIDOCAÍNA 10MG/ML (1%)', 'HYPOCAÍNA', 'UND', 'MD', NULL, 90, 30, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (446, 'SUXAMETÔNIO (CLORETO) 100MG', 'SUCCITRAT', 'UND', 'MD', NULL, 90, 30, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (447, 'ONDANSETRONA 4MG', 'VONAU FLASH', 'COMP', 'MD', NULL, 30, 30, 0, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (448, 'EMICIZUMABE 150MG/ML', 'HEMCIBRA 150MG/ML', 'MG', 'FT', NULL, 30, 1, 150, NULL, 30, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (449, 'EMICIZUMABE 105MG/0,7ML', 'HEMCIBRA 105MG/0,7ML', 'MG', 'FT', NULL, 200, 0, 105, NULL, 120, NULL, 1, NULL);
INSERT INTO `tb_medicamentos` (`med_id`, `med_descr`, `med_descr_coml`, `med_und`, `med_tipo_codigo`, `med_tipo_med`, `med_max`, `med_min`, `med_ui_cx`, `med_bona_codigo`, `med_alert`, `med_diag_id`, `med_ativo`, `med_codigo`) VALUES (450, 'ATENSINA (CLORIDRATO DE CLONIDINA) 0,100MG', '', '0,100MG', 'MD', NULL, 90, 30, 0, NULL, 30, NULL, 1, NULL);
COMMIT;

-- ----------------------------
-- Table structure for tb_movimentacoes
-- ----------------------------
DROP TABLE IF EXISTS `tb_movimentacoes`;
CREATE TABLE `tb_movimentacoes` (
  `mov_id` int NOT NULL,
  `mov_date` datetime DEFAULT NULL,
  `mov_tipo` char(3) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mov_descr` varchar(120) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mov_qtde` mediumint DEFAULT NULL,
  `mov_med_id` int DEFAULT NULL,
  `mov_med_lote` varchar(60) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mov_documento` varchar(90) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mov_user` varchar(80) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`mov_id`),
  KEY `fk_movimentacao_medicamentos` (`mov_med_id`),
  CONSTRAINT `fk_movimentacao_medicamentos` FOREIGN KEY (`mov_med_id`) REFERENCES `tb_medicamentos` (`med_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela Farmacia';

-- ----------------------------
-- Records of tb_movimentacoes
-- ----------------------------
BEGIN;
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (2, '2026-07-07 08:39:35', 'ENT', 'Entrada medicamento para o depósito: ALMOXARIFADO', 350, 3, 'LEAB20M501', '2026-07-8687', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (3, '2026-07-09 08:50:51', 'ENT', 'Entrada medicamento para o depósito: FARMACIA', 15, 6, 'TLG5670AX', '2026-07-5742', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (4, '2026-07-15 12:04:36', 'TRA', 'Transferencia entre Deposito : FARMACIA para ALMOXARIFADO', 10, 6, 'TLG5670AX', '2026075830', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (5, '2026-07-15 12:08:56', 'TRA', 'Transferencia entre Deposito : ALMOXARIFADO para FARMACIA', 10, 6, 'TLG5670AX', '2026075905', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (6, '2026-07-16 12:28:56', 'TRA', 'Transferencia entre Deposito : FARMACIA para ALMOXARIFADO', 5, 6, 'TLG5670AX', '2026074151', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (7, '2026-07-22 09:03:11', 'ENT', 'Entrada medicamento para o depósito: FARMACIA', 150, 276, 'BET5002AC', '2026-07-3461', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (8, '2026-07-22 09:05:28', 'TRA', 'Transferencia entre Deposito : FARMACIA para ALMOXARIFADO', 150, 276, 'BET5002AC', '2026072925', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (9, '2026-07-27 10:32:54', 'REQ', 'Saída por requisição: REQ20264749', 5, 3, 'LEAB20M501', 'REQ20264749', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (10, '2026-07-27 10:32:54', 'REQ', 'Saída por requisição: REQ20264749', 5, 276, 'BET5002AC', 'REQ20264749', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (11, '2026-07-27 10:38:44', 'REQ', 'Saída por requisição: REQ20265280', 5, 3, 'LEAB20M501', 'REQ20265280', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (12, '2026-07-27 10:38:44', 'REQ', 'Saída por requisição: REQ20265280', 5, 276, 'BET5002AC', 'REQ20265280', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (13, '2026-07-27 11:18:51', 'REQ', 'Saída por requisição: REQ20263136', 10, 6, 'TLG5670AX', 'REQ20263136', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (14, '2026-07-27 11:25:55', 'REQ', 'Saída por requisição: REQ20266009', 10, 6, 'TLG5670AX', 'REQ20266009', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (15, '2026-07-27 11:30:51', 'REQ', 'Saída por requisição: REQ20260007', 10, 6, 'TLG5670AX', 'REQ20260007', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (16, '2026-07-27 11:44:05', 'REQ', 'Saída por requisição: REQ20264292', 10, 6, 'TLG5670AX', 'REQ20264292', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (17, '2026-07-28 07:45:04', 'TRA', 'Transferencia entre Deposito : ALMOXARIFADO para FARMACIA', 5, 6, 'TLG5670AX', '2026071952', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (18, '2026-07-29 12:19:44', 'REQ', 'Saída por requisição: REQ20263380', 10, 276, 'BET5002AC', 'REQ20263380', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (19, '2026-07-30 08:35:40', 'REQ', 'Saída por requisição: REQ20268723', 5, 6, 'TLG5670AX', 'REQ20268723', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (20, '2026-07-31 07:43:24', 'ENT', 'Entrada medicamento para o depósito: FARMACIA', 90, 1, 'DP26310741', 'ENT20264904', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (21, '2026-08-05 08:31:14', 'DEV', 'Devolução por requisição: REQ20268027', 5, 3, 'LEAB20M501', 'REQ20268027', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (22, '2026-08-05 08:31:14', 'DEV', 'Devolução por requisição: REQ20268027', 5, 276, 'BET5002AC', 'REQ20268027', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (23, '2026-08-13 09:20:03', 'TRA', 'Transferencia entre Deposito : ALMOXARIFADO para FARMACIA', 5, 3, 'LEAB20M501', '2026084182', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (24, '2026-08-18 10:32:50', 'REQ', 'Saída por requisição: REQ20260422', 5, 3, 'LEAB20M501', 'REQ20260422', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (25, '2026-08-19 11:12:05', 'TRA', 'Transferencia entre Deposito : FARMACIA para ALMOXARIFADO', 10, 3, 'LE20ABM520', '2026081478', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (26, '2026-08-19 11:12:05', 'TRA', 'Transferencia entre Deposito : FARMACIA para ALMOXARIFADO', 5, 3, 'LEAB20M501', '2026083045', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (27, '2026-08-19 11:12:11', 'TRA', 'Transferencia entre Deposito : ALMOXARIFADO para FARMACIA', 20, 3, 'LEAB20M501', '2026085830', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (28, '2026-08-19 11:17:16', 'REQ', 'Saída por requisição: REQ20266700', 2, 1, 'DP26310741', 'REQ20266700', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (29, '2026-08-19 11:17:25', 'REQ', 'Saída por requisição: REQ20260954', 10, 3, 'LE20ABM520', 'REQ20260954', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (30, '2026-08-26 07:48:51', 'DEV', 'Devolução por requisição: REQ20261078', 10, 3, 'LE20ABM520', 'REQ20261078', 'ovidio.neto');
INSERT INTO `tb_movimentacoes` (`mov_id`, `mov_date`, `mov_tipo`, `mov_descr`, `mov_qtde`, `mov_med_id`, `mov_med_lote`, `mov_documento`, `mov_user`) VALUES (31, '2026-08-26 07:48:59', 'REQ', 'Saída por requisição: REQ20265522', 10, 3, 'LE20ABM520', 'REQ20265522', 'ovidio.neto');
COMMIT;

-- ----------------------------
-- Table structure for tb_requisicoes
-- ----------------------------
DROP TABLE IF EXISTS `tb_requisicoes`;
CREATE TABLE `tb_requisicoes` (
  `req_id` int NOT NULL,
  `req_tip_id` tinyint DEFAULT NULL,
  `req_pac_id` int DEFAULT NULL,
  `req_date` date DEFAULT NULL,
  `req_dep_id` int DEFAULT NULL,
  `req_set_id` int DEFAULT NULL,
  `req_local_id` mediumint DEFAULT NULL,
  `req_solicitado_por` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `req_dt_solicitacao` datetime DEFAULT NULL,
  `req_aprovado_por` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `req_dt_aprovacao` datetime DEFAULT NULL,
  `req_reprovado_por` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `req_dt_reprovacao` datetime DEFAULT NULL,
  `req_jus_reprovacao` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `req_status` tinyint DEFAULT NULL COMMENT '0 = Pendente; 1 = Aprovado; 2 = Reprovado; 3 = Devolvido',
  `req_num` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `req_observacao` text COLLATE utf8mb4_general_ci,
  `req_num_devolucao` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Numero da requisição de Devolução',
  PRIMARY KEY (`req_id`) USING BTREE,
  UNIQUE KEY `idx_req_num` (`req_num`) USING BTREE,
  KEY `fk_requisicoes_tipos` (`req_tip_id`),
  KEY `fk_requisicoes_paciente` (`req_pac_id`),
  KEY `fk_requisocoes_deposito` (`req_dep_id`),
  KEY `fk_requisicoes_locais` (`req_local_id`),
  KEY `fk_requisicoes_setores` (`req_set_id`),
  CONSTRAINT `fk_requisicoes_locais` FOREIGN KEY (`req_local_id`) REFERENCES `tb_locais` (`local_id`),
  CONSTRAINT `fk_requisicoes_paciente` FOREIGN KEY (`req_pac_id`) REFERENCES `fsph_ambulatorio`.`tb_pacientes` (`num_paciente`),
  CONSTRAINT `fk_requisicoes_setores` FOREIGN KEY (`req_set_id`) REFERENCES `tb_setores` (`set_id`),
  CONSTRAINT `fk_requisicoes_tipos_req` FOREIGN KEY (`req_tip_id`) REFERENCES `tb_tipos_requisicoes` (`tip_req_id`),
  CONSTRAINT `fk_requisocoes_deposito` FOREIGN KEY (`req_dep_id`) REFERENCES `tb_depositos` (`dep_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela Farmacia';

-- ----------------------------
-- Records of tb_requisicoes
-- ----------------------------
BEGIN;
INSERT INTO `tb_requisicoes` (`req_id`, `req_tip_id`, `req_pac_id`, `req_date`, `req_dep_id`, `req_set_id`, `req_local_id`, `req_solicitado_por`, `req_dt_solicitacao`, `req_aprovado_por`, `req_dt_aprovacao`, `req_reprovado_por`, `req_dt_reprovacao`, `req_jus_reprovacao`, `req_status`, `req_num`, `req_observacao`, `req_num_devolucao`) VALUES (1, 1, 181, '2026-07-22', 2, NULL, 1, 'ovidio.neto', '2026-07-22 10:45:19', 'ovidio.neto', '2026-07-27 10:32:54', NULL, NULL, NULL, 3, 'REQ20264749', NULL, 'REQ20268027');
INSERT INTO `tb_requisicoes` (`req_id`, `req_tip_id`, `req_pac_id`, `req_date`, `req_dep_id`, `req_set_id`, `req_local_id`, `req_solicitado_por`, `req_dt_solicitacao`, `req_aprovado_por`, `req_dt_aprovacao`, `req_reprovado_por`, `req_dt_reprovacao`, `req_jus_reprovacao`, `req_status`, `req_num`, `req_observacao`, `req_num_devolucao`) VALUES (2, 1, 929, '2026-07-22', 2, NULL, 5, 'ovidio.neto', '2026-07-22 10:54:38', 'ovidio.neto', '2026-07-27 10:38:44', NULL, NULL, NULL, 1, 'REQ20265280', NULL, NULL);
INSERT INTO `tb_requisicoes` (`req_id`, `req_tip_id`, `req_pac_id`, `req_date`, `req_dep_id`, `req_set_id`, `req_local_id`, `req_solicitado_por`, `req_dt_solicitacao`, `req_aprovado_por`, `req_dt_aprovacao`, `req_reprovado_por`, `req_dt_reprovacao`, `req_jus_reprovacao`, `req_status`, `req_num`, `req_observacao`, `req_num_devolucao`) VALUES (3, 1, NULL, '2026-07-23', 2, 3339, 1, 'ovidio.neto', '2026-07-23 09:11:31', 'ovidio.neto', '2026-07-29 12:19:44', NULL, NULL, NULL, 1, 'REQ20263380', NULL, NULL);
INSERT INTO `tb_requisicoes` (`req_id`, `req_tip_id`, `req_pac_id`, `req_date`, `req_dep_id`, `req_set_id`, `req_local_id`, `req_solicitado_por`, `req_dt_solicitacao`, `req_aprovado_por`, `req_dt_aprovacao`, `req_reprovado_por`, `req_dt_reprovacao`, `req_jus_reprovacao`, `req_status`, `req_num`, `req_observacao`, `req_num_devolucao`) VALUES (4, 1, 188, '2026-07-27', 1, NULL, 1, 'ovidio.neto', '2026-07-27 11:18:06', 'ovidio.neto', '2026-07-27 11:18:51', NULL, NULL, NULL, 1, 'REQ20263136', NULL, NULL);
INSERT INTO `tb_requisicoes` (`req_id`, `req_tip_id`, `req_pac_id`, `req_date`, `req_dep_id`, `req_set_id`, `req_local_id`, `req_solicitado_por`, `req_dt_solicitacao`, `req_aprovado_por`, `req_dt_aprovacao`, `req_reprovado_por`, `req_dt_reprovacao`, `req_jus_reprovacao`, `req_status`, `req_num`, `req_observacao`, `req_num_devolucao`) VALUES (5, 1, 188, '2026-07-27', 1, NULL, 1, 'ovidio.neto', '2026-07-27 11:25:35', 'ovidio.neto', '2026-07-27 11:25:55', NULL, NULL, NULL, 1, 'REQ20266009', NULL, NULL);
INSERT INTO `tb_requisicoes` (`req_id`, `req_tip_id`, `req_pac_id`, `req_date`, `req_dep_id`, `req_set_id`, `req_local_id`, `req_solicitado_por`, `req_dt_solicitacao`, `req_aprovado_por`, `req_dt_aprovacao`, `req_reprovado_por`, `req_dt_reprovacao`, `req_jus_reprovacao`, `req_status`, `req_num`, `req_observacao`, `req_num_devolucao`) VALUES (6, 1, 188, '2026-07-27', 1, NULL, 1, 'ovidio.neto', '2026-07-27 11:30:38', 'ovidio.neto', '2026-07-27 11:30:51', NULL, NULL, NULL, 1, 'REQ20260007', NULL, NULL);
INSERT INTO `tb_requisicoes` (`req_id`, `req_tip_id`, `req_pac_id`, `req_date`, `req_dep_id`, `req_set_id`, `req_local_id`, `req_solicitado_por`, `req_dt_solicitacao`, `req_aprovado_por`, `req_dt_aprovacao`, `req_reprovado_por`, `req_dt_reprovacao`, `req_jus_reprovacao`, `req_status`, `req_num`, `req_observacao`, `req_num_devolucao`) VALUES (7, 1, 188, '2026-07-27', 1, NULL, 1, 'ovidio.neto', '2026-07-27 11:43:56', 'ovidio.neto', '2026-07-27 11:44:05', NULL, NULL, NULL, 1, 'REQ20264292', NULL, NULL);
INSERT INTO `tb_requisicoes` (`req_id`, `req_tip_id`, `req_pac_id`, `req_date`, `req_dep_id`, `req_set_id`, `req_local_id`, `req_solicitado_por`, `req_dt_solicitacao`, `req_aprovado_por`, `req_dt_aprovacao`, `req_reprovado_por`, `req_dt_reprovacao`, `req_jus_reprovacao`, `req_status`, `req_num`, `req_observacao`, `req_num_devolucao`) VALUES (8, 1, 188, '2026-07-28', 1, NULL, 1, 'ovidio.neto', '2026-07-28 10:31:52', NULL, NULL, NULL, NULL, NULL, 2, 'REQ20269875', NULL, NULL);
INSERT INTO `tb_requisicoes` (`req_id`, `req_tip_id`, `req_pac_id`, `req_date`, `req_dep_id`, `req_set_id`, `req_local_id`, `req_solicitado_por`, `req_dt_solicitacao`, `req_aprovado_por`, `req_dt_aprovacao`, `req_reprovado_por`, `req_dt_reprovacao`, `req_jus_reprovacao`, `req_status`, `req_num`, `req_observacao`, `req_num_devolucao`) VALUES (9, 1, 188, '2026-07-29', 1, NULL, 1, 'ovidio.neto', '2026-07-29 13:12:17', NULL, NULL, NULL, NULL, NULL, 2, 'REQ20268088', NULL, NULL);
INSERT INTO `tb_requisicoes` (`req_id`, `req_tip_id`, `req_pac_id`, `req_date`, `req_dep_id`, `req_set_id`, `req_local_id`, `req_solicitado_por`, `req_dt_solicitacao`, `req_aprovado_por`, `req_dt_aprovacao`, `req_reprovado_por`, `req_dt_reprovacao`, `req_jus_reprovacao`, `req_status`, `req_num`, `req_observacao`, `req_num_devolucao`) VALUES (10, 1, 188, '2026-07-29', 1, NULL, 1, 'ovidio.neto', '2026-07-29 13:20:33', NULL, NULL, 'ovidio.neto', '2026-07-30 07:56:27', 'O PACIENTE PRECISOU TOMAR O MEDICAMENTO.', 2, 'REQ20269558', NULL, NULL);
INSERT INTO `tb_requisicoes` (`req_id`, `req_tip_id`, `req_pac_id`, `req_date`, `req_dep_id`, `req_set_id`, `req_local_id`, `req_solicitado_por`, `req_dt_solicitacao`, `req_aprovado_por`, `req_dt_aprovacao`, `req_reprovado_por`, `req_dt_reprovacao`, `req_jus_reprovacao`, `req_status`, `req_num`, `req_observacao`, `req_num_devolucao`) VALUES (11, 1, NULL, '2026-07-30', 1, 3039, 1, 'ovidio.neto', '2026-07-30 08:35:01', 'ovidio.neto', '2026-07-30 08:35:40', NULL, NULL, NULL, 1, 'REQ20268723', NULL, NULL);
INSERT INTO `tb_requisicoes` (`req_id`, `req_tip_id`, `req_pac_id`, `req_date`, `req_dep_id`, `req_set_id`, `req_local_id`, `req_solicitado_por`, `req_dt_solicitacao`, `req_aprovado_por`, `req_dt_aprovacao`, `req_reprovado_por`, `req_dt_reprovacao`, `req_jus_reprovacao`, `req_status`, `req_num`, `req_observacao`, `req_num_devolucao`) VALUES (12, 1, NULL, '2026-07-30', 2, 3040, 1, 'ovidio.neto', '2026-07-30 13:08:09', NULL, NULL, 'ovidio.neto', '2026-08-18 10:33:16', 'NÃO FOI PRECISO', 2, 'REQ20268914', NULL, NULL);
INSERT INTO `tb_requisicoes` (`req_id`, `req_tip_id`, `req_pac_id`, `req_date`, `req_dep_id`, `req_set_id`, `req_local_id`, `req_solicitado_por`, `req_dt_solicitacao`, `req_aprovado_por`, `req_dt_aprovacao`, `req_reprovado_por`, `req_dt_reprovacao`, `req_jus_reprovacao`, `req_status`, `req_num`, `req_observacao`, `req_num_devolucao`) VALUES (13, 2, 181, '2026-08-03', 2, NULL, 1, 'ovidio.neto', '2026-08-03 11:03:10', NULL, NULL, NULL, NULL, NULL, 3, 'REQ20261196', 'Devolucao da requisicao REQ20264749', NULL);
INSERT INTO `tb_requisicoes` (`req_id`, `req_tip_id`, `req_pac_id`, `req_date`, `req_dep_id`, `req_set_id`, `req_local_id`, `req_solicitado_por`, `req_dt_solicitacao`, `req_aprovado_por`, `req_dt_aprovacao`, `req_reprovado_por`, `req_dt_reprovacao`, `req_jus_reprovacao`, `req_status`, `req_num`, `req_observacao`, `req_num_devolucao`) VALUES (14, 2, 181, '2026-08-04', 2, NULL, 1, 'ovidio.neto', '2026-08-04 11:05:40', 'ovidio.neto', '2026-08-05 08:31:14', NULL, NULL, NULL, 1, 'REQ20268027', NULL, NULL);
INSERT INTO `tb_requisicoes` (`req_id`, `req_tip_id`, `req_pac_id`, `req_date`, `req_dep_id`, `req_set_id`, `req_local_id`, `req_solicitado_por`, `req_dt_solicitacao`, `req_aprovado_por`, `req_dt_aprovacao`, `req_reprovado_por`, `req_dt_reprovacao`, `req_jus_reprovacao`, `req_status`, `req_num`, `req_observacao`, `req_num_devolucao`) VALUES (15, 1, 208, '2026-08-18', 1, NULL, 5, 'ovidio.neto', '2026-08-18 10:32:00', 'ovidio.neto', '2026-08-18 10:32:50', NULL, NULL, NULL, 1, 'REQ20260422', NULL, NULL);
INSERT INTO `tb_requisicoes` (`req_id`, `req_tip_id`, `req_pac_id`, `req_date`, `req_dep_id`, `req_set_id`, `req_local_id`, `req_solicitado_por`, `req_dt_solicitacao`, `req_aprovado_por`, `req_dt_aprovacao`, `req_reprovado_por`, `req_dt_reprovacao`, `req_jus_reprovacao`, `req_status`, `req_num`, `req_observacao`, `req_num_devolucao`) VALUES (16, 1, 499, '2026-08-18', 1, NULL, 1, 'ovidio.neto', '2026-08-18 11:55:01', 'ovidio.neto', '2026-08-19 11:17:16', NULL, NULL, NULL, 1, 'REQ20266700', NULL, NULL);
INSERT INTO `tb_requisicoes` (`req_id`, `req_tip_id`, `req_pac_id`, `req_date`, `req_dep_id`, `req_set_id`, `req_local_id`, `req_solicitado_por`, `req_dt_solicitacao`, `req_aprovado_por`, `req_dt_aprovacao`, `req_reprovado_por`, `req_dt_reprovacao`, `req_jus_reprovacao`, `req_status`, `req_num`, `req_observacao`, `req_num_devolucao`) VALUES (17, 1, 412, '2026-08-19', 1, NULL, 1, 'ovidio.neto', '2026-08-19 11:15:34', 'ovidio.neto', '2026-08-19 11:17:25', NULL, NULL, NULL, 3, 'REQ20260954', NULL, 'REQ20261078');
INSERT INTO `tb_requisicoes` (`req_id`, `req_tip_id`, `req_pac_id`, `req_date`, `req_dep_id`, `req_set_id`, `req_local_id`, `req_solicitado_por`, `req_dt_solicitacao`, `req_aprovado_por`, `req_dt_aprovacao`, `req_reprovado_por`, `req_dt_reprovacao`, `req_jus_reprovacao`, `req_status`, `req_num`, `req_observacao`, `req_num_devolucao`) VALUES (18, 2, 412, '2026-08-19', 1, NULL, 1, 'ovidio.neto', '2026-08-19 11:21:15', 'ovidio.neto', '2026-08-26 07:48:51', NULL, NULL, NULL, 1, 'REQ20261078', NULL, NULL);
INSERT INTO `tb_requisicoes` (`req_id`, `req_tip_id`, `req_pac_id`, `req_date`, `req_dep_id`, `req_set_id`, `req_local_id`, `req_solicitado_por`, `req_dt_solicitacao`, `req_aprovado_por`, `req_dt_aprovacao`, `req_reprovado_por`, `req_dt_reprovacao`, `req_jus_reprovacao`, `req_status`, `req_num`, `req_observacao`, `req_num_devolucao`) VALUES (19, 1, 499, '2026-08-26', 1, NULL, 5, 'ovidio.neto', '2026-08-26 07:48:27', 'ovidio.neto', '2026-08-26 07:48:59', NULL, NULL, NULL, 1, 'REQ20265522', NULL, NULL);
COMMIT;

-- ----------------------------
-- Table structure for tb_setores
-- ----------------------------
DROP TABLE IF EXISTS `tb_setores`;
CREATE TABLE `tb_setores` (
  `set_id` int NOT NULL,
  `set_descr` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `set_ativo` tinyint DEFAULT NULL,
  PRIMARY KEY (`set_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela Farmacia';

-- ----------------------------
-- Records of tb_setores
-- ----------------------------
BEGIN;
INSERT INTO `tb_setores` (`set_id`, `set_descr`, `set_ativo`) VALUES (3039, 'COLETA', 1);
INSERT INTO `tb_setores` (`set_id`, `set_descr`, `set_ativo`) VALUES (3040, 'AFERESE', 1);
INSERT INTO `tb_setores` (`set_id`, `set_descr`, `set_ativo`) VALUES (3339, 'TRANSFUSÃO', 1);
INSERT INTO `tb_setores` (`set_id`, `set_descr`, `set_ativo`) VALUES (4043, 'FISIOTERAPIA', 1);
INSERT INTO `tb_setores` (`set_id`, `set_descr`, `set_ativo`) VALUES (4044, 'SAIDA VALIDADE VENCIDA', 1);
COMMIT;

-- ----------------------------
-- Table structure for tb_solicitacoes
-- ----------------------------
DROP TABLE IF EXISTS `tb_solicitacoes`;
CREATE TABLE `tb_solicitacoes` (
  `sol_id` int NOT NULL,
  `sol_date` date DEFAULT NULL,
  `sol_dep_ori_id` int DEFAULT NULL,
  `sol_dep_des_id` int DEFAULT NULL,
  `sol_status` tinyint DEFAULT NULL COMMENT '0 = Aberto; 1 = Fechado',
  `sol_obs` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sol_user_create` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sol_user_aprov` varchar(80) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sol_date_aprov` date DEFAULT NULL,
  PRIMARY KEY (`sol_id`),
  KEY `fk_sol_depositos` (`sol_dep_ori_id`),
  KEY `fk_sol_deposito_destino` (`sol_dep_des_id`),
  CONSTRAINT `fk_sol_deposito_destino` FOREIGN KEY (`sol_dep_des_id`) REFERENCES `tb_depositos` (`dep_id`),
  CONSTRAINT `fk_sol_deposito_origem` FOREIGN KEY (`sol_dep_ori_id`) REFERENCES `tb_depositos` (`dep_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela Farmacia';

-- ----------------------------
-- Records of tb_solicitacoes
-- ----------------------------
BEGIN;
INSERT INTO `tb_solicitacoes` (`sol_id`, `sol_date`, `sol_dep_ori_id`, `sol_dep_des_id`, `sol_status`, `sol_obs`, `sol_user_create`, `sol_user_aprov`, `sol_date_aprov`) VALUES (1, '2026-08-19', 1, 2, 1, '', 'ovidio.neto', 'ovidio.neto', '2026-08-19');
INSERT INTO `tb_solicitacoes` (`sol_id`, `sol_date`, `sol_dep_ori_id`, `sol_dep_des_id`, `sol_status`, `sol_obs`, `sol_user_create`, `sol_user_aprov`, `sol_date_aprov`) VALUES (2, '2026-08-19', 2, 1, 1, '', 'ovidio.neto', 'ovidio.neto', '2026-08-19');
INSERT INTO `tb_solicitacoes` (`sol_id`, `sol_date`, `sol_dep_ori_id`, `sol_dep_des_id`, `sol_status`, `sol_obs`, `sol_user_create`, `sol_user_aprov`, `sol_date_aprov`) VALUES (3, '2026-09-09', 2, 1, 0, '', 'ovidio.neto', NULL, NULL);
COMMIT;

-- ----------------------------
-- Table structure for tb_tipos_medicamentos
-- ----------------------------
DROP TABLE IF EXISTS `tb_tipos_medicamentos`;
CREATE TABLE `tb_tipos_medicamentos` (
  `tipo_id` int NOT NULL,
  `tipo_codigo` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `tipo_descr` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tipo_ativo` tinyint DEFAULT NULL,
  `tipo_vincul` char(1) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`tipo_id`),
  UNIQUE KEY `idx_tipo_codigo` (`tipo_codigo`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela Farmacia';

-- ----------------------------
-- Records of tb_tipos_medicamentos
-- ----------------------------
BEGIN;
INSERT INTO `tb_tipos_medicamentos` (`tipo_id`, `tipo_codigo`, `tipo_descr`, `tipo_ativo`, `tipo_vincul`) VALUES (1, 'AC', 'ACIDO TRANEXAMICO', 1, 'N');
INSERT INTO `tb_tipos_medicamentos` (`tipo_id`, `tipo_codigo`, `tipo_descr`, `tipo_ativo`, `tipo_vincul`) VALUES (2, 'FT', 'FATORES', 1, 'S');
INSERT INTO `tb_tipos_medicamentos` (`tipo_id`, `tipo_codigo`, `tipo_descr`, `tipo_ativo`, `tipo_vincul`) VALUES (3, 'DE', 'DEMANDAS ESPECIFICAS', 1, 'N');
INSERT INTO `tb_tipos_medicamentos` (`tipo_id`, `tipo_codigo`, `tipo_descr`, `tipo_ativo`, `tipo_vincul`) VALUES (5, 'MD', 'MEDICAMENTOS', 1, 'N');
INSERT INTO `tb_tipos_medicamentos` (`tipo_id`, `tipo_codigo`, `tipo_descr`, `tipo_ativo`, `tipo_vincul`) VALUES (6, 'MT', 'MATERIAIS', 1, 'N');
COMMIT;

-- ----------------------------
-- Table structure for tb_tipos_requisicoes
-- ----------------------------
DROP TABLE IF EXISTS `tb_tipos_requisicoes`;
CREATE TABLE `tb_tipos_requisicoes` (
  `tip_req_id` tinyint NOT NULL,
  `tip_req_codigo` varchar(3) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tip_req_descr` varchar(90) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`tip_req_id`) USING BTREE,
  UNIQUE KEY `idx_tipos_requisicoes` (`tip_req_codigo`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela Farmacia';

-- ----------------------------
-- Records of tb_tipos_requisicoes
-- ----------------------------
BEGIN;
INSERT INTO `tb_tipos_requisicoes` (`tip_req_id`, `tip_req_codigo`, `tip_req_descr`) VALUES (1, 'DIS', 'DISPENSAÇÃO');
INSERT INTO `tb_tipos_requisicoes` (`tip_req_id`, `tip_req_codigo`, `tip_req_descr`) VALUES (2, 'DEV', 'DEVOLUÇÃO');
COMMIT;

-- ----------------------------
-- View structure for vw_dados_impressao
-- ----------------------------
DROP VIEW IF EXISTS `vw_dados_impressao`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `vw_dados_impressao` AS select `r`.`req_id` AS `req_id`,`r`.`req_num` AS `req_num`,`r`.`req_date` AS `req_date`,`r`.`req_dt_solicitacao` AS `req_dt_solicitacao`,`r`.`req_status` AS `req_status`,`r`.`req_solicitado_por` AS `req_solicitado_por`,`r`.`req_aprovado_por` AS `req_aprovado_por`,`r`.`req_dt_aprovacao` AS `req_dt_aprovacao`,`r`.`req_observacao` AS `req_observacao`,`p`.`num_paciente` AS `num_paciente`,`p`.`nom_paciente` AS `nom_paciente`,`p`.`nom_social` AS `nom_social`,`p`.`cpf` AS `cpf`,`dep`.`dep_descr` AS `deposito`,`l`.`local_descr` AS `local`,`t`.`tip_req_descr` AS `tipo` from ((((`tb_requisicoes` `r` left join `fsph_ambulatorio`.`tb_pacientes` `p` on((`r`.`req_pac_id` = `p`.`num_paciente`))) left join `tb_locais` `l` on((`r`.`req_local_id` = `l`.`local_id`))) left join `tb_tipos_requisicoes` `t` on((`r`.`req_tip_id` = `t`.`tip_req_id`))) left join `tb_depositos` `dep` on((`r`.`req_dep_id` = `dep`.`dep_id`)));

-- ----------------------------
-- View structure for vw_requisicoes
-- ----------------------------
DROP VIEW IF EXISTS `vw_requisicoes`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `vw_requisicoes` AS select `r`.`req_id` AS `requisicao`,`r`.`req_num` AS `numero`,`r`.`req_date` AS `data`,`p`.`nom_paciente` AS `paciente`,`s`.`set_descr` AS `setor`,`dep`.`dep_descr` AS `deposito`,`l`.`local_descr` AS `local`,`t`.`tip_req_descr` AS `tipo`,`r`.`req_status` AS `status`,`r`.`req_dep_id` AS `req_dep_id`,`r`.`req_solicitado_por` AS `solicitado_por` from (((((`tb_requisicoes` `r` left join `fsph_ambulatorio`.`tb_pacientes` `p` on((`r`.`req_pac_id` = `p`.`num_paciente`))) left join `tb_setores` `s` on((`r`.`req_set_id` = `s`.`set_id`))) left join `tb_locais` `l` on((`r`.`req_local_id` = `l`.`local_id`))) left join `tb_tipos_requisicoes` `t` on((`r`.`req_tip_id` = `t`.`tip_req_id`))) left join `tb_depositos` `dep` on((`r`.`req_dep_id` = `dep`.`dep_id`)));

-- ----------------------------
-- View structure for vw_requisicoes_nao_aprovadas
-- ----------------------------
DROP VIEW IF EXISTS `vw_requisicoes_nao_aprovadas`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `vw_requisicoes_nao_aprovadas` AS select `r`.`req_id` AS `requisicao`,`r`.`req_num` AS `req_num`,`r`.`req_date` AS `data`,`p`.`nom_paciente` AS `paciente`,`s`.`set_descr` AS `setor`,`dep`.`dep_descr` AS `deposito`,`l`.`local_descr` AS `local`,`t`.`tip_req_descr` AS `tipo`,`r`.`req_status` AS `status` from (((((`tb_requisicoes` `r` left join `fsph_ambulatorio`.`tb_pacientes` `p` on((`r`.`req_pac_id` = `p`.`num_paciente`))) left join `tb_setores` `s` on((`r`.`req_set_id` = `s`.`set_id`))) left join `tb_locais` `l` on((`r`.`req_local_id` = `l`.`local_id`))) left join `tb_tipos_requisicoes` `t` on((`r`.`req_tip_id` = `t`.`tip_req_id`))) left join `tb_depositos` `dep` on((`r`.`req_dep_id` = `dep`.`dep_id`)));

SET FOREIGN_KEY_CHECKS = 1;

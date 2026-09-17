/*
 Navicat Premium Dump SQL

 Source Server         : MSSQLServer
 Source Server Type    : SQL Server
 Source Server Version : 15002000 (15.00.2000)
 Source Host           : 172.23.42.11:1433
 Source Catalog        : dbFarma
 Source Schema         : dbo

 Target Server Type    : SQL Server
 Target Server Version : 15002000 (15.00.2000)
 File Encoding         : 65001

 Date: 17/09/2026 11:51:17
*/


-- ----------------------------
-- Table structure for tabMed
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tabMed]') AND type IN ('U'))
	DROP TABLE [dbo].[tabMed]
GO

CREATE TABLE [dbo].[tabMed] (
  [Codigo] float(53)  NOT NULL,
  [Descr] nvarchar(255) COLLATE Latin1_General_CI_AS  NULL,
  [Descr_Coml] nvarchar(80) COLLATE Latin1_General_CI_AS  NULL,
  [Und] nvarchar(8) COLLATE Latin1_General_CI_AS  NULL,
  [Tipo_Mat] nvarchar(2) COLLATE Latin1_General_CI_AS  NULL,
  [Tipo_Med] nvarchar(30) COLLATE Latin1_General_CI_AS  NULL,
  [Min] smallint  NULL,
  [Max] smallint  NULL,
  [UI_Cx] int  NULL,
  [CodBona] nchar(10) COLLATE Latin1_General_CI_AS  NULL,
  [AlertaVal] smallint  NULL,
  [numFicha] float(53)  NULL,
  [GrpRelDir] smallint  NULL,
  [CodDiag] smallint  NULL
)
GO

ALTER TABLE [dbo].[tabMed] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tabMed
-- ----------------------------
BEGIN TRANSACTION
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'1', N'AAS ACIDO ACETILSALICILICO 100MG', N'DORMEC', N'COMP', N'MD', N'NÃO CONTROLADO', N'5', N'20', N'0', N'0         ', N'90', N'1001', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'2', N'AMINOFILINA 24MG/ML', N'TEUTO', N'AMP', N'MD', N'NÃO CONTROLADO', N'1', N'100', N'0', N'0         ', N'90', N'1002', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'3', N'AMIODARONA, CLORITRADO DE 150 MG/3ML', N'ATLANSIL', N'amp', N'MD', N'NÃO CONTROLADO', N'6', N'36', N'0', N'          ', N'90', N'1003', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'4', N'ATROPINA, SULFATO DE 0,25MG/ML', N'PASMODEX', N'amp', N'MD', N'NÃO CONTROLADO', N'6', N'36', N'0', N'          ', N'90', N'1004', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'5', N'BICARBONATO DE SODIO 8,4% 84MG/ML', N'BICARBONATO', N'amp', N'MD', N'NÃO CONTROLADO', N'5', N'50', N'0', N'          ', N'90', N'1005', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'7', N'CAPTOPRIL 25MG COMPRIMIDO', N'CAPTOPRIL', N'comp', N'MD', N'NÃO CONTROLADO', N'50', N'200', N'0', N'          ', N'90', N'1007', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'8', N'SORO FISIOLOGICO 0,9% 10ML', N'NACL', N'fr amp', N'MD', N'NÃO CONTROLADO', N'50', N'200', N'0', N'          ', N'90', N'1008', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'9', N'DESLANOSIDEO 0,2MG/ML', N'DESLANOL', N'amp', N'MD', N'NÃO CONTROLADO', N'5', N'50', N'0', N'          ', N'90', N'1009', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'10', N'DEXCLOFENIRAMINA, MALETO DE 2MG/5ML', N'TEUTO', N'fr', N'MD', N'NÃO CONTROLADO', N'5', N'20', N'0', N'          ', N'90', N'1010', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'11', N'DEXAMETASONA 4MG/ML', N'CORTICODEX', N'amp', N'MD', N'NÃO CONTROLADO', N'5', N'20', N'0', N'          ', N'90', N'1011', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'12', N'DIAZEPAM 5MG/ML', N'DIAZEPAN', N'amp', N'MD', N'CONTROLADO', N'5', N'10', N'0', N'          ', N'90', N'1012', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'13', N'DIPIRONA SODICA AMPOLA 2ML', N'NEO QUIMICA', N'amp', N'MD', N'NÃO CONTROLADO', N'50', N'150', N'0', N'          ', N'90', N'1013', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'14', N'DIPIRONA SODICA COMPRIMIDO 500MG', N'DIPIRONA', N'COMP', N'MD', N'NÃO CONTROLADO', N'10', N'60', N'0', N'0         ', N'90', N'1014', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'15', N'DOPAMINA. CLORIDRATO DE 5MG/ML', N'DOPAMINA', N'amp', N'MD', N'CONTROLADO', N'5', N'10', N'0', N'          ', N'90', N'1015', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'16', N'ESCOPOLAMINA 4MG/ML + DIPIRONA 500MG/ML', N'', N'AMP', N'MD', N'NÃO CONTROLADO', N'5', N'15', N'0', N'0         ', N'90', N'1016', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'17', N'FENITOINA SODICA 5%', N'FENITAL', N'amp', N'MD', N'CONTROLADO', N'5', N'10', N'0', N'          ', N'90', N'1017', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'18', N'FENOBARBITAL SODICO 100MG/ML', N'FENOCRIS', N'amp', N'MD', N'CONTROLADO', N'5', N'10', N'0', N'          ', N'90', N'1018', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'19', N'FENTANILA. CITRATO DE 0,05MG/ML', N'FENTANEST', N'amp', N'MD', N'CONTROLADO', N'5', N'10', N'0', N'          ', N'90', N'1019', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'20', N'FLUMAZENIL 0,5MG/5ML AMPOLA', N'FLUMAZENIL', N'AMP', N'MD', N'CONTROLADO', N'5', N'10', N'0', N'0         ', N'90', N'1020', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'21', N'FUROSEMIDA 10MG/ML', N'LASIX', N'AMP', N'MD', N'NÃO CONTROLADO', N'50', N'100', N'0', N'0         ', N'90', N'1021', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'22', N'FUROSEMIDA 20MG/2ML', N'FUROSEFARMA', N'amp', N'MD', N'NÃO CONTROLADO', N'50', N'100', N'0', N'          ', N'90', N'1021', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'23', N'GLICONATO DE CALCIO 10%', N'CALCIO', N'fr amp', N'MD', N'NÃO CONTROLADO', N'5', N'50', N'0', N'          ', N'90', N'1023', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'24', N'GLICOSE 25% 10ML', N'GLICOSE', N'AMP', N'MD', N'NÃO CONTROLADO', N'30', N'100', N'0', N'0         ', N'90', N'1024', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'25', N'GLICOSE 50% 10ML', N'GLICOSE', N'AMP', N'MD', N'NÃO CONTROLADO', N'30', N'100', N'0', N'0         ', N'90', N'1025', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'27', N'EPINEFRINA 0,1%', N'EPIFRIN 0,1%', N'amp', N'MD', N'NÃO CONTROLADO', N'30', N'50', N'0', N'          ', N'90', N'1027', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'28', N'HEPARINA SODICA 5000 UI / ML', N'HEPAMAX S', N'fr amp', N'MD', N'NÃO CONTROLADO', N'5', N'10', N'0', N'          ', N'90', N'1028', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'29', N'HIDRALAZINA, CLORIDRATO DE  20MG/ML', N'NEPRESOL', N'amp', N'MD', N'NÃO CONTROLADO', N'5', N'10', N'0', N'          ', N'90', N'1029', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'30', N'HIDROCORTISONA 500MG', N'ANDROCORTIL', N'amp', N'MD', N'NÃO CONTROLADO', N'50', N'100', N'0', N'          ', N'90', N'1194', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'31', N'LIDOCAINA 10% SPRAY', N'XYLESTSIN', N'fr', N'MD', N'NÃO CONTROLADO', N'1', N'3', N'0', N'          ', N'90', N'1031', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'32', N'LIDOCAINA CLORIDRATO + EPINEFRINA 1:200.000', N'HYPOCAINA COM VASO', N'fr amp', N'MD', N'NÃO CONTROLADO', N'3', N'10', N'0', N'          ', N'90', N'32', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'34', N'LIDOCAINA CLORIDRATO SEM VASOCONSTRUTOR', N'XYLESTSIN 2%', N'FR AMP', N'MD', N'NÃO CONTROLADO', N'3', N'10', N'0', N'0         ', N'90', N'1032', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'35', N'METOCLOPRAMIDA, CLORIDRATO DE 10MG/2ML', N'NOPROSIL', N'fr amp', N'MD', N'NÃO CONTROLADO', N'3', N'15', N'0', N'          ', N'90', N'1035', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'36', N'MGOH + ALOH + DIMETICONA', N'GASTROGEL', N'fr', N'MD', N'NÃO CONTROLADO', N'0', N'5', N'0', N'          ', N'90', N'1036', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'37', N'MIDAZOLAN 1MG/ML', N'DORMIRE', N'amp', N'MD', N'CONTROLADO', N'3', N'5', N'0', N'          ', N'90', N'1037', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'38', N'MIDAZOLAN 5MG/ML', N'HIPOLABOR', N'amp', N'MD', N'CONTROLADO', N'3', N'5', N'0', N'          ', N'90', N'1038', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'39', N'MORFINA, SULFATO DE 10MG/ML', N'DIMORF', N'amp', N'MD', N'CONTROLADO', N'5', N'10', N'0', N'          ', N'90', N'1039', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'40', N'NALOXONA CLORIDRATO 0,4MG/ML', N'NARCAN', N'amp', N'MD', N'CONTROLADO', N'5', N'10', N'0', N'          ', N'90', N'1040', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'41', N'PARACETAMOL 200MG/ML GOTAS', N'PARACETAMOL', N'fr', N'MD', N'NÃO CONTROLADO', N'5', N'10', N'0', N'          ', N'90', N'1041', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'42', N'PETIDINA, CLORIDRATO 50MG/ML', N'MEPERIDINA; DOLOSAL', N'amp', N'MD', N'CONTROLADO', N'3', N'5', N'0', N'          ', N'90', N'1042', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'45', N'PROMETAZINA, CLORIDRATO DE 25MG/ML', N'PAMERGAN', N'amp', N'MD', N'NÃO CONTROLADO', N'10', N'20', N'0', N'          ', N'90', N'1045', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'47', N'PROMETAZINA, CLORIDRATO DE 50MG/2ML', N'FENERGAN', N'amp', N'MD', N'NÃO CONTROLADO', N'10', N'20', N'0', N'          ', N'90', N'1045', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'48', N'TERBUTALINA, SULFATO DE', N'TERBUTALINA', N'amp', N'MD', N'NÃO CONTROLADO', N'3', N'25', N'0', N'          ', N'90', N'1048', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'49', N'AGUA DESTILADA (PARA INJECAO) 2ML', N'', N'und', N'MT', N'CONTROLADO', N'1', N'5', N'0', N'          ', N'32', N'1113', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'50', N'AGULHA HIPODERMICA 40 X 12 18G', N'DESCARPACK', N'und', N'MT', N'CONTROLADO', N'40', N'200', N'0', N'          ', N'32', N'1050', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'51', N'AGULHA P COLETA DE SANGUE A VACUO', N'VACUPLAST', N'und', N'MT', N'NÃO CONTROLADO', N'10', N'30', N'0', N'          ', N'32', N'1051', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'52', N'AGULHA PARA FISTULA ARTERIO-VENOSA', N'NIPRO', N'und', N'MT', N'CONTROLADO', N'5', N'10', N'0', N'          ', N'32', N'1052', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'53', N'ALGODAO HIDROFILO', N'ALGO BOM', N'und', N'MT', N'CONTROLADO', N'2', N'3', N'0', N'          ', N'32', N'1181', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'55', N'CATETER INTRAVENOSO 18G', N'SOLIDOR', N'und', N'MT', N'NÃO CONTROLADO', N'10', N'15', N'0', N'          ', N'32', N'1055', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'56', N'CATETER INTRAVENOSO 22G', N'BBRAUM', N'und', N'MT', N'NÃO CONTROLADO', N'10', N'150', N'0', N'          ', N'32', N'1056', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'57', N'CATETER INTRAVENOSO 24G', N'BD ANGIOCATH', N'und', N'MT', N'NÃO CONTROLADO', N'10', N'150', N'0', N'          ', N'32', N'1195', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'58', N'EQUIPO PARA INFUSÃO DE SANGUE', N'EMBRAMED', N'und', N'MT', N'NÃO CONTROLADO', N'20', N'200', N'0', N'          ', N'45', N'1058', N'3', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'59', N'ESPARADRAPO IMPERMEAVEL', N'PROCITEX', N'und', N'MT', N'CONTROLADO', N'1', N'3', N'0', N'          ', N'32', N'1059', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'60', N'TORNEIRA 3 VIAS', N'MEDTAP', N'und', N'MT', N'NÃO CONTROLADO', N'5', N'50', N'0', N'          ', N'45', N'1060', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'63', N'GAZE HIDROFILA', N'GAZE', N'und', N'MT', N'CONTROLADO', N'1', N'2', N'0', N'          ', N'32', N'1063', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'64', N'GEL CONDUTOR', N'', N'und', N'MT', N'', N'1', N'2', N'0', N'          ', N'32', N'1064', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'65', N'RINGER COM LACTATO 500 ML', N'KABIPAC', N'und', N'MD', N'CONTROLADO', N'2', N'5', N'0', N'          ', N'32', N'1065', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'66', N'ESCALPE INTRAVENOSO 21G', N'MED GOLD', N'und', N'MT', N'NÃO CONTROLADO', N'40', N'200', N'0', N'          ', N'32', N'1066', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'67', N'SERINGA HIPODERMICA 10ML C/ AGULHA', N'DESCARPACK ', N'und', N'MT', N'NÃO CONTROLADO', N'15', N'30', N'0', N'          ', N'32', N'1067', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'68', N'SERINGA HIPODERMICA 5ML SEM AGULHA', N'', N'und', N'MT', N'NÃO CONTROLADO', N'40', N'100', N'0', N'          ', N'32', N'1068', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'69', N'SERINGA HIPODERMICA 10ML SEM AGULHA', N'ADVANTIVE', N'und', N'MT', N'NÃO CONTROLADO', N'40', N'100', N'0', N'          ', N'45', N'1069', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'70', N'SERINGA HIPODERMICA 1ML C/ AGULHA', N'STKL', N'und', N'MT', N'NÃO CONTROLADO', N'5', N'15', N'0', N'          ', N'32', N'1070', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'71', N'SERINGA HIPODERMICA 20ML C/ AGULHA', N'DESCARPACK', N'und', N'MT', N'NÃO CONTROLADO', N'10', N'10', N'0', N'          ', N'32', N'1071', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'72', N'SERINGA HIPODERMICA 3ML C/ AGULHA', N'SR', N'und', N'MT', N'NÃO CONTROLADO', N'15', N'300', N'0', N'          ', N'45', N'1072', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'73', N'SERINGA HIPODERMICA 5ML C/ AGULHA', N'SR', N'und', N'MT', N'NÃO CONTROLADO', N'15', N'100', N'0', N'          ', N'32', N'1073', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'74', N'SORO FISIOLOGICO BOLSA 250 ML', N'HALEXISTAR', N'bolsa', N'MD', N'CONTROLADO', N'3', N'5', N'0', N'          ', N'90', N'1074', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'75', N'SORO FISIOLOGICO BOLSA 500 ML', N'HALEXISTAR', N'bolsa', N'MD', N'CONTROLADO', N'3', N'5', N'0', N'          ', N'90', N'1075', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'76', N'REVELADOR REF 8610248', N'', N'fr', N'MT', N'NÃO CONTROLADO', N'1', N'2', N'0', N'0         ', N'32', N'1076', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'77', N'SORO FISIOLOGICO FRASCO 250 ML', N'', N'FRASCO', N'MD', N'CONTROLADO', N'3', N'5', N'0', N'0         ', N'90', N'1077', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'78', N'GLICOSE 5% 500ML', N'FARNACE', N'bolsa', N'MD', N'NÃO CONTROLADO', N'3', N'10', N'0', N'0         ', N'90', N'1078', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'79', N'ACIDOTRANEXAMICO 250 MG', N'HEMOBLOCK', N'Comp', N'FT', N'NÃO CONTROLADO', N'24', N'240', N'1', N'ACID250   ', N'180', N'1079', N'0', N'9')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'80', N'FATOR VIII 250 UI', N'HEMOFIL', N'UI', N'FT', N'NÃO CONTROLADO', N'20', N'200', N'250', N'VIII250   ', N'120', N'1080', N'0', N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'81', N'FATOR IX 600 UI', N'IMMUNINE', N'UI', N'FT', N'NÃO CONTROLADO', N'40', N'240', N'600', N'IX600     ', N'180', N'1081', N'0', N'2')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'82', N'FATOR VIII 250 UI', N'OCTAVI', N'UI', N'FT', N'NÃO CONTROLADO', N'0', N'0', N'250', N'VIII250   ', N'180', N'1082', N'0', N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'83', N'FATOR VIII 500 UI', N'FACTANE - LFB', N'UI', N'FT', N'NÃO CONTROLADO', N'15', N'150', N'500', N'VIII500   ', N'180', N'1083', N'0', N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'84', N'FATOR VIII 1000 UI', N'HEMOFILL M', N'UI', N'FT', N'NÃO CONTROLADO', N'40', N'120', N'1000', N'VIII1000  ', N'180', N'1084', N'0', N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'85', N'FLUOR GEL', N'FLUOR GEL', N'fr', N'MD', N'NÃO CONTROLADO', N'2', N'10', N'0', N'0         ', N'90', N'1085', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'86', N'FATOR VIIIY 500 UI', N'IMMUNATE', N'UI', N'FT', N'NÃO CONTROLADO', N'40', N'120', N'500', N'VIIIY500  ', N'180', N'1086', N'0', N'3')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'87', N'IRM', N'', N'CX', N'MT', N'NÃO CONTROLADO', N'1', N'5', N'0', N'0         ', N'32', N'1087', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'88', N'PRILOCAINA, CLORIDRATO DE 30MG/ML', N'CITANEST', N'carp', N'MD', N'NÃO CONTROLADO', N'50', N'100', N'0', N'0         ', N'90', N'1088', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'89', N'BICARBONATO DE SODIO', N'POLIDENTAL', N'fr', N'MD', N'NÃO CONTROLADO', N'1', N'3', N'0', N'0         ', N'90', N'1089', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'90', N'FIXADOR REF 1562826', N'', N'fr', N'MT', N'NÃO CONTROLADO', N'1', N'2', N'0', N'0         ', N'32', N'1090', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'91', N'FEIBA 500 UI', N'FEIBA', N'UI', N'FT', N'NÃO CONTROLADO', N'40', N'250', N'500', N'FEI500    ', N'180', N'1091', N'0', N'9')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'93', N'FATOR VIII 500 UI', N'FANDHI', N'UI', N'FT', N'NÃO CONTROLADO', N'30', N'350', N'500', N'VIII500   ', N'180', N'1093', N'0', N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'94', N'FRALDA DESCARTAVEL ADULTO TAM G', N'BIG LIFE', N'un', N'MT', N'NÃO CONTROLADO', N'5', N'24', N'0', N'0         ', N'32', N'1094', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'97', N'IMIGLUCERASE 400 UI', N'', N'FR AMP', N'GC', N'NÃO CONTROLADO', N'40', N'160', N'400', N'GAU400    ', N'80', N'1097', N'0', N'10')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'98', N'FATOR IX 200 UI', N'IMMUNINE', N'UI', N'FT', N'NÃO CONTROLADO', N'40', N'160', N'200', N'IX200     ', N'180', N'1098', N'0', N'2')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'99', N'CLORIDRATO DE PROPRANOLOL 10 MG', N'', N'comp', N'MD', N'NÃO CONTROLADO', N'30', N'60', N'0', N'0         ', N'90', N'1099', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'100', N'FATOR VIII 1000 UI', N'OCTAVI', N'UI', N'FT', N'NÃO CONTROLADO', N'50', N'200', N'1000', N'VIII1000  ', N'180', N'1100', N'0', N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'101', N'FATOR VII A', N'NOVOSERVEN', N'UI', N'FT', N'NÃO CONTROLADO', N'15', N'45', N'60000', N'VIIA60    ', N'180', N'1101', N'0', N'9')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'102', N'BERIPLEX PN 500 UI', N'BERIPLEX', N'UI', N'FT', N'NÃO CONTROLADO', N'40', N'120', N'500', N'BER500    ', N'180', N'1102', N'0', N'9')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'103', N'BEZILATO DE ATRACURIO 10 MG/ML', N'TRACUR 10MG/ML', N'amp', N'MD', N'NÃO CONTROLADO', N'0', N'0', N'0', N'          ', N'90', N'1103', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'104', N'ACETATO DE DESMOPRESSINA 4 MCG/ML', N'DDAVP', N'Amp', N'FT', N'NÃO CONTROLADO', N'0', N'5', N'1', N'ACETA     ', N'180', N'1104', N'0', N'9')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'105', N'FEIBA 1000 UI', N'FEIBA', N'UI', N'FT', N'NÃO CONTROLADO', N'50', N'150', N'1000', N'FEI1000   ', N'180', N'1105', N'0', N'9')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'106', N'AGUA DESTILADA 5ML', N'', N'amp', N'MD', N'NÃO CONTROLADO', N'15', N'100', N'0', N'          ', N'90', N'1106', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'108', N'LUVA ESTERIL 7.0', N'NEW HAND', N'um', N'MT', N'NÃO CONTROLADO', N'0', N'0', N'0', N'          ', N'32', N'1108', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'109', N'LUVA ESTERIL 7.5', N'NEW HAND', N'um', N'MT', N'NÃO CONTROLADO', N'0', N'0', N'0', N'          ', N'32', N'1109', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'110', N'SORO FISIOLOGICO 0,9% FRASCO 500ML', N'', N'FR', N'MD', N'NÃO CONTROLADO', N'3', N'5', N'0', N'0         ', N'90', N'1075', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'111', N'LUVA DE PROCEDIMENTOS TAM PEQUENO', N'DESCCARPACK', N'cx', N'MT', N'NÃO CONTROLADO', N'2', N'3', N'0', N'          ', N'32', N'1111', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'112', N'BOLSA SIMPLES CPDA-1', N'FRESENIUS KABI', N'un', N'MT', N'NÃO CONTROLADO', N'10', N'84', N'0', N'          ', N'45', N'1112', N'1', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'113', N'AGUA DESTILADA DE 10 ML', N'ISOFARMA', N'amp', N'MD', N'NÃO CONTROLADO', N'10', N'30', N'0', N'          ', N'90', N'1113', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'114', N'ALCOOL 70%', N'ITAJA', N'lt', N'MT', N'NÃO CONTROLADO', N'1', N'2', N'0', N'          ', N'32', N'1114', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'115', N'DESCARTEX', N'SAFEPACK', N'un', N'MT', N'NÃO CONTROLADO', N'1', N'2', N'0', N'          ', N'32', N'1115', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'116', N'FATOR VIII 500 UI', N'HEMOFILL M', N'UI', N'FT', N'NÃO CONTROLADO', N'32', N'72', N'500', N'VIII500   ', N'180', N'1116', N'0', N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'117', N'TUBO TAMPA ROXA', N'VACUETTE', N'un', N'MT', N'NÃO CONTROLADO', N'2', N'3', N'0', N'          ', N'32', N'1117', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'118', N'EQUIPO PARA BOMBA', N'BBRAUM', N'un', N'MT', N'NÃO CONTROLADO', N'20', N'50', N'0', N'          ', N'32', N'1118', N'2', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'120', N'DIPIRONA SODICA 500MG/ML GOTAS', N'FARMACE', N'fr', N'MD', N'NÃO CONTROLADO', N'5', N'15', N'0', N'          ', N'90', N'1120', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'121', N'PARACETAMOL 500 MG COMPRIMIDO', N'PARACETAMOL', N'comp', N'MD', N'NÃO CONTROLADO', N'10', N'50', N'0', N'          ', N'90', N'1121', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'122', N'FATOR VIII 250 UI', N'FANDHI', N'UI', N'FT', N'NÃO CONTROLADO', N'20', N'350', N'250', N'VIII250   ', N'180', N'1122', N'0', N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'123', N'AGULHA HIPOD. PARA PREPARO DE FATOR', N'', N'UI', N'MT', N'NÃO CONTROLADO', N'2', N'30', N'0', N'          ', N'32', N'1123', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'124', N'HIDROCORTISONA 100MG', N'ANDROCORTIL', N'FR AMP', N'MD', N'NÃO CONTROLADO', N'50', N'200', N'0', N'0         ', N'90', N'1124', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'125', N'CURATIVO BLOOD STOP', N'BLOOD STOP', N'un', N'MT', N'NÃO CONTROLADO', N'200', N'1000', N'0', N'          ', N'32', N'1125', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'126', N'ACIDO ÉPSILON-AMINOCAPROICO 500MG COMPRIMIDO', N'IPSILON', N'comp', N'MD', N'NÃO CONTROLADO', N'72', N'360', N'0', N'          ', N'90', N'1126', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'129', N'AGULHA HIPODERMICA 22 G 25X7', N'MEDNEEDLE', N'un', N'MT', N'NÃO CONTROLADO', N'10', N'25', N'0', N'          ', N'32', N'1129', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'131', N'LUVA DE PROCEDIMENTOS TAM G', N'', N'cx', N'MT', N'NÃO CONTROLADO', N'1', N'3', N'0', N'          ', N'32', N'1131', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'132', N'FRALDA DESCARTAVEL ADULTO TAM M', N'', N'und', N'MT', N'NÃO CONTROLADO', N'10', N'100', N'0', N'          ', N'32', N'1132', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'133', N'AGULHA HIPODERMICA 20G', N'STERICAN', N'und ', N'MT', N'NÃO CONTROLADO', N'2', N'100', N'0', N'          ', N'32', N'1133', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'134', N'AGULHA HIPODERMICA 23G', N'', N'und', N'MT', N'NÃO CONTROLADO', N'2', N'100', N'0', N'          ', N'32', N'1134', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'135', N'AGULHA HIPODERMICA 19G', N'', N'und', N'MT', N'NÃO CONTROLADO', N'2', N'100', N'0', N'          ', N'32', N'1135', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'136', N'CATETER INTRAVENOSO 20G', N'BBRAUN', N'und', N'MT', N'NÃO CONTROLADO', N'5', N'15', N'0', N'          ', N'32', N'1136', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'137', N'CATETER INTRAVENOSO 14G', N'SOLIDOR', N'und', N'MT', N'NÃO CONTROLADO', N'5', N'20', N'0', N'          ', N'32', N'1137', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'138', N'ESCALPE INTRAVENOSO 23 G', N'MED GOLDMAN', N'und', N'MT', N'NÃO CONTROLADO', N'20', N'100', N'0', N'          ', N'32', N'1138', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'139', N'PERFURADOR', N'', N'und', N'MT', N'NÃO CONTROLADO', N'0', N'1', N'0', N'          ', N'32', N'1139', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'140', N'EXTRATOR GRAMPOS', N'', N'und', N'MT', N'NÃO CONTROLADO', N'0', N'1', N'0', N'          ', N'32', N'1140', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'141', N'TESOURA', N'', N'und', N'MT', N'NÃO CONTROLADO', N'0', N'1', N'0', N'          ', N'32', N'1141', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'142', N'ESCALPE INTRAVENOSO 19 G', N'LAMEDID', N'und', N'MT', N'NÃO CONTROLADO', N'0', N'1', N'0', N'          ', N'32', N'1142', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'143', N'PASTA CLASSIFICADORA', N'', N'und', N'MT', N'NÃO CONTROLADO', N'0', N'0', N'0', N'          ', N'32', N'1143', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'144', N'ISOPOR', N'', N'und', N'MT', N'NÃO CONTROLADO', N'0', N'0', N'0', N'          ', N'32', N'1144', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'145', N'FITA CREPE', N'', N'und', N'MT', N'NÃO CONTROLADO', N'0', N'0', N'0', N'          ', N'32', N'1145', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'146', N'SERINGA HIPODERMICA 1ML C/ AGULHA', N'TKL', N'und', N'MT', N'NÃO CONTROLADO', N'2', N'20', N'0', N'          ', N'35', N'1146', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'147', N'LENÇOL', N'', N'und', N'MT', N'NÃO CONTROLADO', N'0', N'0', N'0', N'          ', N'32', N'1147', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'148', N'FATOR IX 250 UI', N'OCTANINE F', N'UI', N'FT', N'NÃO CONTROLADO', N'10', N'100', N'250', N'IX250     ', N'180', N'1148', N'0', N'2')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'149', N'FATOR IX 500 UI', N'OCTANINE F', N'UI', N'FT', N'NÃO CONTROLADO', N'10', N'100', N'500', N'IX500     ', N'180', N'1149', N'0', N'2')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'150', N'LENÇOL DESCARTAVEL', N'PROTDESC', N'und', N'MT', N'NÃO CONTROLADO', N'0', N'0', N'0', N'          ', N'32', N'1150', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'151', N'GRAMPEADOR', N'', N'und', N'MT', N'NÃO CONTROLADO', N'0', N'0', N'0', N'          ', N'32', N'1151', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'152', N'FATOR VIII 1000 UI', N'OPTIVATE', N'UI', N'FT', N'NÃO CONTROLADO', N'10', N'100', N'1000', N'VIII1000  ', N'180', N'1152', N'0', N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'153', N'FATOR VIII 500 UI', N'OPTIVATE', N'UI', N'FT', N'NÃO CONTROLADO', N'0', N'0', N'500', N'VIII500   ', N'180', N'1153', N'0', N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'154', N'FATOR VIII 250 UI', N'OPTIVATE', N'UI', N'FT', N'NÃO CONTROLADO', N'0', N'0', N'250', N'VIII250   ', N'180', N'1154', N'0', N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'155', N'ALFATALIGLICERASE 200 UI', N'', N'FR AMP', N'GC', N'NÃO CONTROLADO', N'15', N'30', N'200', N'GAU200    ', N'90', N'1155', N'0', N'10')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'156', N'TERMOMETRO', N'TERMOMED', N'un', N'MT', N'NÃO CONTROLADO', N'0', N'0', N'0', N'          ', N'32', N'1156', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'157', N'MASCARA CIRURGICA DESCARTÁVEL', N'NEOSTOCK', N'un', N'MT', N'NÃO CONTROLADO', N'20', N'100', N'0', N'          ', N'32', N'1157', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'158', N'FATOR VIII 1000 UI', N'FANDHI', N'UI', N'FT', N'NÃO CONTROLADO', N'0', N'100', N'1000', N'VIII1000  ', N'180', N'1158', N'0', N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'159', N'PILHA AAA', N'', N'und', N'MT', N'NÃO CONTROLADO', N'0', N'0', N'0', N'          ', N'32', N'1159', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'160', N'LIVRO DE ATA', N'', N'und', N'MT', N'NÃO CONTROLADO', N'0', N'0', N'0', N'          ', N'32', N'1160', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'161', N'PAPEL A4', N'', N'res', N'MT', N'NÃO CONTROLADO', N'0', N'0', N'0', N'0         ', N'32', N'1161', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'162', N'PILHA AA', N'THON', N'und', N'MT', N'NÃO CONTROLADO', N'4', N'12', N'0', N'0         ', N'32', N'1162', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'163', N'FATOR VIII 500 UI', N'OCTAVI', N'UI', N'FT', N'NÃO CONTROLADO', N'0', N'0', N'500', N'VIII500   ', N'180', N'1163', N'0', N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'164', N'BOLSAS PLATICAS', N'', N'SC', N'MT', N'NÃO CONTROLADO', N'0', N'0', N'0', N'0         ', N'32', N'1164', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'165', N'FILTRO DE INFUSAO', N'CACE', N'und', N'MT', N'NÃO CONTROLADO', N'0', N'0', N'0', N'0         ', N'32', N'1165', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'166', N'FICHA PRATELEIRA', N'FICHA', N'un', N'MT', N'NÃO CONTROLADO', N'10', N'100', N'0', N'0         ', N'32', N'1166', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'167', N'CATAFLAN EMULSÃO GEL', N'CATAFLAN', N'fr', N'MD', N'NÃO CONTROLADO', N'5', N'10', N'0', N'0         ', N'90', N'1167', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'168', N'FATOR VIIIY 450 UI', N'WILATE', N'UI', N'FT', N'NÃO CONTROLADO', N'10', N'120', N'450', N'VIIIY450  ', N'180', N'1168', N'0', N'3')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'169', N'BOLSA DUPLA', N'BOLSA DUPLA', N'un', N'MT', N'NÃO CONTROLADO', N'0', N'50', N'0', N'0         ', N'32', N'1169', N'1', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'170', N'JALECO DESCARTAVEL PEQ', N'CLEANTECH', N'un', N'MT', N'NÃO CONTROLADO', N'5', N'60', N'0', N'0         ', N'32', N'1170', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'171', N'DIMENIDRINATO 12,5MG/5ML', N'DRAMIN', N'frasco', N'MD', N'NÃO CONTROLADO', N'2', N'5', N'0', N'0         ', N'90', N'1279', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'172', N'BUTILBROMETO DE ESCOPOLAMINA 20MG/ML', N'BUSCOPAM', N'amp', N'MD', N'NÃO CONTROLADO', N'2', N'15', N'0', N'0         ', N'90', N'1172', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'173', N'CLIP PEQUENO', N'CLIP', N'caixa', N'MT', N'NÃO CONTROLADO', N'1', N'1', N'0', N'0         ', N'32', N'1173', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'174', N'AVENTAL DESCARTAVEL', N'CLEANTECH', N'un', N'MT', N'NÃO CONTROLADO', N'5', N'10', N'0', N'0         ', N'32', N'1179', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'175', N'AGUA PARA INJEÇAO 1000ML', N'FRESENIUS KABI', N'frasco', N'MD', N'NÃO CONTROLADO', N'1', N'5', N'0', N'0         ', N'90', N'1175', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'176', N'SOLUÇÃO ISOTÔNICA DE GLICOSE A 5%', N'SEGMENTA', N'bolsa', N'MD', N'NÃO CONTROLADO', N'10', N'50', N'0', N'0         ', N'90', N'1176', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'177', N'LUVA DE PROCEDIMENTO TAM MEDIO', N'DESCARPACK', N'caixa', N'MT', N'NÃO CONTROLADO', N'2', N'5', N'0', N'0         ', N'90', N'1177', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'178', N'FATOR IX 250 UI', N'FACTANE - LFB', N'UI', N'FT', N'NÃO CONTROLADO', N'0', N'0', N'250', N'IX250     ', N'180', N'1178', N'0', N'2')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'179', N'AVENTAL DESCARTAVEL', N'DESCARPACK', N'und', N'MT', N'NÃO CONTROLADO', N'5', N'10', N'0', N'0         ', N'90', N'1179', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'180', N'TUBO LATEX PARA GARROTE', N'GARROTE', N'metro', N'MT', N'NÃO CONTROLADO', N'1', N'10', N'0', N'0         ', N'0', N'1180', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'181', N'ALGODAO HIDROFILO', N'NATHALYA ', N'un', N'MT', N'NÃO CONTROLADO', N'1', N'10', N'0', N'0         ', N'120', N'1181', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'182', N'SORO FISIOLÓGICO 0,9% BOLSA 500ML', N'HALEXISTAR', N'bolsa', N'MD', N'NÃO CONTROLADO', N'3', N'10', N'0', N'0         ', N'120', N'1075', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'183', N'DESCARTEX 7 LITROS', N'RAVAPACK', N'und', N'MT', N'NÃO CONTROLADO', N'5', N'10', N'0', N'0         ', N'45', N'1183', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'184', N'BUTILBROMETO DE ESCOPOLAMINA 20MG/ML', N'UNIÃO QUIMICA', N'AMP', N'MD', N'NÃO CONTROLADO', N'2', N'15', N'0', N'0         ', N'90', N'1172', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'185', N'DESCARTEX 10,3L', N'RAVAPACK', N'und', N'MT', N'NÃO CONTROLADO', N'0', N'0', N'0', N'0         ', N'120', N'1185', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'186', N'DEXCLOFENIRAMINA, MALETO DE 2MG', N'HISTAMIN;POLARAMINE', N'comp', N'MD', N'NÃO CONTROLADO', N'20', N'60', N'0', N'0         ', N'90', N'1010', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'187', N'DESCARTEX 13L', N'SHARP BOX', N'und', N'MT', N'NÃO CONTROLADO', N'2', N'10', N'0', N'0         ', N'0', N'1187', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'188', N'CATETER INTRAVENOSO 22G', N'SOLIDOR', N'und', N'MT', N'NÃO CONTROLADO', N'50', N'150', N'0', N'0         ', N'0', N'1056', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'189', N'DIPIRONA SÓDICA 500MG/ML', N'DIPIFARMA ', N'AMPOLA', N'MD', N'NÃO CONTROLADO', N'50', N'100', N'0', N'0         ', N'90', N'1189', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'190', N'DESCARTEX 18 LITROS', N'RAVAPACK', N'', N'MT', N'NÃO CONTROLADO', N'3', N'10', N'0', N'0         ', N'30', N'1190', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'191', N'CLORIDRATO DE PROPRANOLOL 40 MG', N'AMPRAX', N'comp', N'MD', N'NÃO CONTROLADO', N'25', N'50', N'0', N'0         ', N'90', N'1191', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'192', N'HIDROCLOROTIAZIDA 25MG', N'ROYTON', N'comp', N'MD', N'NÃO CONTROLADO', N'10', N'100', N'0', N'0         ', N'90', N'1192', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'193', N'HIDROCLOROTIAZIDA 25MG', N'TEUTO', N'comp', N'MD', N'NÃO CONTROLADO', N'10', N'100', N'0', N'0         ', N'90', N'1193', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'194', N'HIDROCORTISONA 500MG', N'CORTISONAL', N'fr amp', N'MD', N'NÃO CONTROLADO', N'50', N'100', N'0', N'0         ', N'90', N'1194', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'195', N'CATETER INTRAVENOSO 24G', N'SOLIDOR', N'und', N'MT', N'NÃO CONTROLADO', N'25', N'100', N'0', N'0         ', N'90', N'1195', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'196', N'FATOR VIII 1000 UI', N'BERIATE P', N'UI', N'FT', N'NÃO CONTROLADO', N'10', N'100', N'1000', N'VIII1000  ', N'180', N'1196', N'0', N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'197', N'ISOSSORBIDA, DINITRATO 5MG SL', N'ANGIL', N'compr', N'MD', N'NÃO CONTROLADO', N'3', N'10', N'0', N'0         ', N'90', N'1197', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'198', N'ADENOSINA 3MG/ML', N'HIPOLABOR', N'amp', N'MD', N'NÃO CONTROLADO', N'4', N'15', N'0', N'0         ', N'90', N'1198', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'199', N'DOBUTAMINA, CLORIDRATO 250MG/20ML', N'DOBUTANIL', N'amp', N'MD', N'NÃO CONTROLADO', N'4', N'15', N'0', N'0         ', N'90', N'1199', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'200', N'NOREPINEFRINA, HEMITARTARATO 8MG/4ML', N'NOVAFARMA', N'amp', N'MD', N'NÃO CONTROLADO', N'15', N'30', N'0', N'0         ', N'90', N'1200', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'201', N'MAGNESIO, SULFATO 10%', N'ISOFARMA', N'AMP', N'MD', N'NÃO CONTROLADO', N'10', N'30', N'0', N'0         ', N'90', N'1201', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'202', N'HIDROCORTISONA 100MG', N'CORTISON', N'FR AMP', N'MD', N'NÃO CONTROLADO', N'50', N'200', N'0', N'0         ', N'90', N'1124', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'203', N'COMPLEXO PROTROMBINICO 600 UI', N'BAXTER', N'UI', N'FT', N'NÃO CONTROLADO', N'10', N'20', N'600', N'BER600    ', N'180', N'1203', N'0', N'7')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'204', N'DESCARTEX 3L', N'SHARPBOX', N'un', N'MT', N'NÃO CONTROLADO', N'0', N'10', N'0', N'0         ', N'120', N'1204', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'205', N'ALCOOL 70%', N'QUALITY', N'un', N'MT', N'NÃO CONTROLADO', N'0', N'10', N'0', N'0         ', N'90', N'1114', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'206', N'CATETER NASAL PARA OXIGÊNIO (SONDA)', N'EMBRAMED', N'und', N'MT', N'NÃO CONTROLADO', N'5', N'20', N'0', N'0         ', N'45', N'1206', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'207', N'ESCALPE INTRAVENOSO 23G', N'STARMED', N'und', N'MT', N'NÃO CONTROLADO', N'10', N'100', N'0', N'0         ', N'45', N'207', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'208', N'ESCALPE INTRAVENOSO 23G', N'LAMEDID', N'und', N'MT', N'NÃO CONTROLADO', N'10', N'100', N'0', N'0         ', N'45', N'208', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'209', N'SERINGA HIPODERMICA 10ML SEM AGULHA', N'DESCARPACK', N'und', N'MT', N'NÃO CONTROLADO', N'10', N'100', N'0', N'0         ', N'45', N'209', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'210', N'SERINGA HIPODERMICA 3ML SEM AGULHA', N'EMBRAMAC', N'und', N'MT', N'NÃO CONTROLADO', N'10', N'100', N'0', N'0         ', N'45', N'210', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'211', N'AGULHA HIPODREMICA 30 X 0,80', N'DESCARPACK', N'und', N'MT', N'NÃO CONTROLADO', N'20', N'100', N'0', N'0         ', N'45', N'1211', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'212', N'INTRACATH 16 GA', N'INTRACATH ', N'und', N'MT', N'NÃO CONTROLADO', N'1', N'5', N'0', N'0         ', N'45', N'1212', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'213', N'INTRACATH 22 GA', N'INTRACATH ', N'und', N'MT', N'NÃO CONTROLADO', N'1', N'5', N'0', N'0         ', N'45', N'1213', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'214', N'CATETER INTRAVENOSO 16G', N'SOLIDOR', N'und', N'MT', N'NÃO CONTROLADO', N'5', N'50', N'0', N'0         ', N'45', N'1214', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'215', N'ESCALPE INTRAVENOSO 25G', N'LAMEDID', N'und', N'MT', N'NÃO CONTROLADO', N'5', N'10', N'0', N'0         ', N'45', N'1215', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'216', N'ESCALPE INTRAVENOSO 27G', N'LAMEDID', N'und', N'MT', N'NÃO CONTROLADO', N'5', N'20', N'0', N'0         ', N'45', N'1216', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'217', N'SONDA NASOGASTRICA CURTA NR 18', N'BD', N'und', N'MT', N'NÃO CONTROLADO', N'5', N'20', N'0', N'0         ', N'45', N'1217', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'218', N'SONDA NASOGASTRICA CURTA NR 16', N'', N'und', N'MT', N'NÃO CONTROLADO', N'5', N'20', N'0', N'0         ', N'45', N'1218', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'219', N'SONDA NASOGASTRICA CURTA NR 20', N'', N'und', N'MT', N'NÃO CONTROLADO', N'5', N'20', N'0', N'0         ', N'45', N'1219', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'220', N'ATADURA CREPE', N'CREPE', N'rolo', N'MT', N'NÃO CONTROLADO', N'5', N'20', N'0', N'0         ', N'45', N'1220', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'221', N'SONDA DE ASPIRAÇÃO NR 10', N'SONDA DE ASPIRAÇÃO', N'und', N'MT', N'NÃO CONTROLADO', N'5', N'20', N'0', N'0         ', N'0', N'1221', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'222', N'SONDA DE FOLEY NR 12', N'BD', N'und', N'MT', N'NÃO CONTROLADO', N'5', N'20', N'0', N'0         ', N'45', N'1222', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'223', N'TUBO TRAQUEAL NR 4,0', N'TUBO TRAQUEAL', N'und', N'MT', N'NÃO CONTROLADO', N'5', N'20', N'0', N'0         ', N'45', N'1223', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'224', N'TUBO TRAQUEAL NR 5,0', N'TUBO TRAQUEAL', N'und', N'MT', N'NÃO CONTROLADO', N'5', N'20', N'0', N'0         ', N'45', N'1224', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'225', N'TUBO TRAQUEAL NR 6,0', N'TUBO TRAQUEAL', N'und', N'MT', N'NÃO CONTROLADO', N'5', N'20', N'0', N'0         ', N'45', N'1225', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'226', N'TUBO TRAQUEAL NR 6,5', N'TUBO TRAQUEAL', N'und', N'MT', N'NÃO CONTROLADO', N'5', N'20', N'0', N'0         ', N'45', N'1226', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'227', N'TUBO TRAQUEAL NR 7,5', N'TUBO TRAQUEAL', N'und', N'MT', N'NÃO CONTROLADO', N'5', N'20', N'0', N'0         ', N'45', N'1227', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'228', N'TUBO TRAQUEAL NR 8,0', N'TUBO TRAQUEAL', N'und', N'MT', N'NÃO CONTROLADO', N'5', N'20', N'0', N'0         ', N'45', N'1228', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'229', N'TUBO TRAQUEAL NR 8,5', N'TUBO TRAQUEAL', N'und', N'MT', N'NÃO CONTROLADO', N'5', N'20', N'0', N'0         ', N'45', N'1229', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'230', N'TUBO TRAQUEAL NR 9,0', N'TUBO TRAQUEAL', N'und', N'MT', N'NÃO CONTROLADO', N'5', N'20', N'0', N'0         ', N'45', N'1230', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'231', N'COLETOR DE URINA SIST FECHADO', N'BD', N'und', N'MT', N'NÃO CONTROLADO', N'5', N'20', N'0', N'0         ', N'45', N'1231', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'232', N'AMBU COMPLETO ADULTO', N'AMBU', N'und', N'MT', N'NÃO CONTROLADO', N'1', N'2', N'0', N'0         ', N'30', N'1232', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'233', N'AMBU COMPLETO INFANTIL', N'AMBU', N'und', N'MT', N'NÃO CONTROLADO', N'1', N'2', N'0', N'0         ', N'30', N'1233', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'234', N'AMBU COMPLETO NEONATAL', N'AMBU', N'und', N'MT', N'NÃO CONTROLADO', N'1', N'2', N'0', N'0         ', N'30', N'1234', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'235', N'GUEDEL NR 1', N'GUEDEL', N'und', N'MT', N'NÃO CONTROLADO', N'1', N'2', N'0', N'0         ', N'30', N'1235', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'236', N'GUEDEL NR 2', N'GUEDEL', N'und', N'MT', N'NÃO CONTROLADO', N'1', N'2', N'0', N'0         ', N'30', N'1236', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'237', N'GUEDEL NR 3', N'GUEDEL', N'und', N'MT', N'NÃO CONTROLADO', N'1', N'2', N'0', N'0         ', N'30', N'1237', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'238', N'GUEDEL NR 4', N'GUEDEL', N'und', N'MT', N'NÃO CONTROLADO', N'1', N'2', N'0', N'0         ', N'30', N'1238', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'239', N'GUEDEL NR 5', N'GUEDEL', N'und', N'MT', N'NÃO CONTROLADO', N'1', N'2', N'0', N'0         ', N'30', N'1239', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'240', N'GUEDEL NR 6', N'GUEDEL', N'und', N'MT', N'NÃO CONTROLADO', N'1', N'2', N'0', N'0         ', N'30', N'1240', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'241', N'GUEDEL NR 7', N'GUEDEL', N'und', N'MT', N'NÃO CONTROLADO', N'1', N'2', N'0', N'0         ', N'30', N'1241', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'242', N'GUEDEL NR 8', N'GUEDEL', N'und', N'MT', N'NÃO CONTROLADO', N'1', N'2', N'0', N'0         ', N'30', N'1242', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'243', N'GUEDEL NR 9', N'GUEDEL', N'und', N'MT', N'NÃO CONTROLADO', N'1', N'2', N'0', N'0         ', N'30', N'1243', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'244', N'UMIDIFICADOR', N'UMIDIFICADOR', N'und', N'MT', N'NÃO CONTROLADO', N'1', N'2', N'0', N'0         ', N'30', N'1244', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'245', N'FRASCO DE ASPIRAÇÃO', N'FRASCO DE ASPIRAÇÃO', N'und', N'MT', N'NÃO CONTROLADO', N'1', N'2', N'0', N'0         ', N'30', N'1245', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'248', N'TUBO DE LATEX', N'IDEATEX', N'un', N'MT', N'NÃO CONTROLADO', N'0', N'0', N'0', N'0         ', N'30', N'1248', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'249', N'SERINGA HIPODERMICA 10ML SEM AGULHA', N'BBRAUN', N'und', N'MT', N'NÃO CONTROLADO', N'0', N'0', N'0', N'0         ', N'90', N'249', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'250', N'ESCALPE INTRAVENOSO 23G', N'HOSPIRA', N'und', N'MT', N'NÃO CONTROLADO', N'0', N'0', N'0', N'0         ', N'90', N'250', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'251', N'CANULA 16G PARA ASPIRACAO DE MEDULA', N'BIOMEDICAL', N'un', N'MT', N'NÃO CONTROLADO', N'10', N'48', N'0', N'0         ', N'120', N'1251', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'252', N'CANULA 18G PARA ASPIRACAO DE MEDULA', N'BIOMEDICAL', N'un', N'MT', N'NÃO CONTROLADO', N'10', N'48', N'0', N'0         ', N'120', N'1252', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'253', N'SERINGA HIPODERMICA 5ML COM AGULHA', N'DESCARPACK', N'un', N'MD', N'NÃO CONTROLADO', N'10', N'200', N'0', N'0         ', N'90', N'1073', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'254', N'TOUCA DESCARTÁVEL', N'DESCARPACK', N'un', N'MT', N'NÃO CONTROLADO', N'5', N'100', N'0', N'0         ', N'45', N'1254', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'255', N'ESCALPE INTRAVENOSO 23 G', N'BBRAUM', N'un', N'MT', N'NÃO CONTROLADO', N'10', N'100', N'0', N'0         ', N'45', N'255', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'256', N'SERINGA HIPODERMICA 3ML SEM AGULHA', N'BBRAUM ', N'un', N'MT', N'NÃO CONTROLADO', N'10', N'1000', N'0', N'0         ', N'45', N'1072', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'257', N'SERINGA HIPODERMICA 5ML SEM AGULHA', N'BBRAUM', N'un', N'MT', N'NÃO CONTROLADO', N'10', N'100', N'0', N'0         ', N'45', N'1068', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'258', N'FATOR VIII 250 UI', N'CSL', N'UI', N'FT', N'NÃO CONTROLADO', N'50', N'200', N'250', N'VIII250   ', N'180', N'258', N'0', N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'259', N'FATOR VIII 500 UI', N'CSL', N'UI', N'FT', N'NÃO CONTROLADO', N'50', N'200', N'500', N'VIII500   ', N'180', N'259', N'0', N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'260', N'MIGLUSTATE 100MG', N'', N'COMP', N'GC', N'NÃO CONTROLADO', N'0', N'0', N'100', N'GAU100    ', N'45', N'1260', N'0', N'10')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'261', N'DICLOFENACO DIETILAMÔNIO 11,6 MG/G  GEL', N'DICLOFENACO', N'bisn', N'MD', N'NÃO CONTROLADO', N'2', N'5', N'0', N'0         ', N'45', N'1261', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'262', N'BANDAGEM ADESIVA HIPO-ALERGICA', N'CURATIVO', N'', N'MT', N'NÃO CONTROLADO', N'100', N'500', N'0', N'0         ', N'45', N'1125', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'263', N'CATETER INTRAVENOSO 20G', N'SOLIDOR', N'und', N'MT', N'NÃO CONTROLADO', N'50', N'200', N'0', N'0         ', N'45', N'1136', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'264', N'EXTENSOR PARA EQUIPO 400MM', N'EXTENSOR', N'und', N'MT', N'NÃO CONTROLADO', N'5', N'10', N'0', N'0         ', N'45', N'1264', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'265', N'EQUIPO MACROGOTAS', N'MEDEQUIPO', N'und', N'MT', N'NÃO CONTROLADO', N'5', N'10', N'0', N'0         ', N'45', N'1265', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'266', N'EXTENSOR 02 VIAS', N'COMPO JET', N'und', N'MT', N'NÃO CONTROLADO', N'5', N'20', N'0', N'0         ', N'45', N'1266', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'267', N'CATETER INTRAVENOSO 22 G', N'DESCARPACK ', N'un', N'MT', N'NÃO CONTROLADO', N'50', N'150', N'0', N'0         ', N'120', N'1056', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'268', N'FATOR VIIIY 500 UI', N'BPL', N'UI', N'FT', N'NÃO CONTROLADO', N'50', N'100', N'500', N'VIIIY500  ', N'180', N'2000000', N'0', N'3')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'269', N'CAPTOPRIL 25MG', N'CAPTOMED', N'comp', N'MD', N'NÃO CONTROLADO', N'50', N'200', N'0', N'0         ', N'120', N'1007', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'270', N'LACRE', N'LACRE', N'un', N'MT', N'NÃO CONTROLADO', N'5', N'100', N'0', N'0         ', N'30', N'1270', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'271', N'ACETATO DE DESMOPRESSINA 15 MCG/ML', N'DDAVP 15 MCG/ML', N'Amp', N'FT', N'NÃO CONTROLADO', N'10', N'50', N'1', N'ACETA15   ', N'120', N'1104', N'0', N'9')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'272', N'AGULHA HIPODERMICA 13X0,45', N'DESCARPACK', N'', N'MT', N'NÃO CONTROLADO', N'5', N'20', N'0', N'0         ', N'45', N'1272', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'273', N'AGULHA HIPODERMICA 40 X 12 18G', N'BD', N'un', N'MT', N'NÃO CONTROLADO', N'20', N'200', N'0', N'0         ', N'45', N'1050', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'274', N'FRALDA DESCARTAVEL ADULTO TAM G', N'CONFORTEX', N'un', N'MT', N'NÃO CONTROLADO', N'5', N'25', N'0', N'0         ', N'45', N'1094', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'275', N'FRALDA DESCARTAVEL ADULTO TAM M', N'CONFORTEX', N'und', N'MT', N'NÃO CONTROLADO', N'5', N'25', N'0', N'0         ', N'45', N'1132', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'276', N'FATOR IX 500 UI', N'BETAFACT- CSL', N'UI', N'FT', N'NÃO CONTROLADO', N'30', N'150', N'500', N'IX500     ', N'180', N'1', N'0', N'2')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'277', N'FUROSEMIDA 10MG/ML', N'TEUTO', N'amp', N'MD', N'NÃO CONTROLADO', N'20', N'100', N'0', N'0         ', N'120', N'1021', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'278', N'SOLUCAO GLICOFISIOLOGICA 500ML', N'KABIPAC', N'un', N'MD', N'NÃO CONTROLADO', N'5', N'30', N'0', N'0         ', N'90', N'1278', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'279', N'DIMENIDRINATO 50MG/ML I.M.', N'NYCOMED', N'AMP', N'MD', N'NÃO CONTROLADO', N'10', N'100', N'0', N'0         ', N'90', N'1279', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'280', N'LAMINA PARA MICROSCOPIA ', N'SOLIDOR', N'und', N'MT', N'NÃO CONTROLADO', N'50', N'100', N'0', N'0         ', N'35', N'1280', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'281', N'SERINGA HIPODERMICA 20ML C/ AGULHA', N'SR  ', N'und', N'MT', N'NÃO CONTROLADO', N'10', N'200', N'0', N'0         ', N'45', N'1071', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'283', N'BOLSA SIMPLES CPDA1', N'TERUMO ', N'un', N'MT', N'NÃO CONTROLADO', N'10', N'100', N'0', N'0         ', N'90', N'1112', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'284', N'CLOREXIDINA SOLUÇÃO ALCOOLICA 5%', N'VICFARMA', N'litro', N'MT', N'NÃO CONTROLADO', N'1', N'2', N'0', N'0         ', N'35', N'1284', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'285', N'LUVA ESTERIL TAM 8.0', N'NEW HAND', N'und', N'MT', N'NÃO CONTROLADO', N'2', N'8', N'0', N'0         ', N'90', N'800', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'286', N'BOLSA TRIPLA CPDA-1', N'TERUMO ', N'un', N'MT', N'NÃO CONTROLADO', N'5', N'84', N'0', N'0         ', N'30', N'1286', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'287', N'LUVA DE PROCEDIMENTO TAM M', N'HANDCARE', N'un', N'MT', N'NÃO CONTROLADO', N'2', N'10', N'0', N'0         ', N'90', N'4000009', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'288', N'ESCALPE 21G', N'BD', N'un', N'MT', N'NÃO CONTROLADO', N'10', N'500', N'0', N'0         ', N'90', N'66', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'289', N'FUROSEMIDA 10MG/ML', N'HYPOFARMA', N'un', N'MD', N'NÃO CONTROLADO', N'10', N'100', N'0', N'0         ', N'90', N'1021', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'290', N'CATETER INTRAVENOSO 22G', N'BD ANGIOCATH ', N'un', N'MT', N'NÃO CONTROLADO', N'20', N'150', N'0', N'0         ', N'45', N'1056', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'291', N'AGUA DESTILADA 10ML', N'FARMACE', N'und', N'MD', N'NÃO CONTROLADO', N'10', N'400', N'0', N'0         ', N'120', N'1113', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'292', N'FENOTEROL (BROMIDRATO) 5MG/ML', N'TEUTO', N'UND', N'MD', N'NÃO CONTROLADO', N'1', N'10', N'0', N'0         ', N'90', N'1292', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'293', N'IPRATROPIO (BROMETO) 0,25MG/ML', N'IPRATROPIO (BROMETO) 0,25MG/ML', N'FRASCO', N'MD', N'NÃO CONTROLADO', N'0', N'5', N'0', N'0         ', N'90', N'1293', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'294', N'CATETER INTRAVENOSO 20G', N'INJEX-CATH', N'un', N'MT', N'NÃO CONTROLADO', N'20', N'50', N'0', N'0         ', N'35', N'1136', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'295', N'CATETER INTRAVENOSO 24G', N'INJEX- CATH', N'', N'MT', N'NÃO CONTROLADO', N'20', N'50', N'0', N'0         ', N'35', N'1195', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'296', N'SERINGA HIPODERMICA 3ML C/ AGULHA', N'DESCARPACK', N'un', N'MT', N'NÃO CONTROLADO', N'20', N'100', N'0', N'0         ', N'35', N'1072', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'297', N'SERINGA HIPODERMICA 20ML C/ AGULHA ', N'INJEX', N'un', N'MT', N'NÃO CONTROLADO', N'20', N'100', N'0', N'0         ', N'35', N'1071', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'298', N'CATETER INTRAVENOSO 22G', N'INJEX-CATH', N'un', N'MT', N'NÃO CONTROLADO', N'20', N'50', N'0', N'0         ', N'0', N'1056', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'299', N'FEIBA 2500 UI  ', N'FEIBA ', N'UI', N'FT', N'NÃO CONTROLADO', N'20', N'100', N'2500', N'FEI2500   ', N'180', N'1299', N'0', N'9')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'300', N'FATOR VIII 250 UI RECOMBINANTE', N'HEMOBRAS', N'UI', N'FT', N'NÃO CONTROLADO', N'20', N'100', N'250', N'VIII250R  ', N'180', N'300', N'0', N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'301', N'FATOR VIII 500 UI RECOMBINANTE', N'HEMOBRAS', N'UI', N'FT', N'NÃO CONTROLADO', N'20', N'100', N'500', N'VIII500R  ', N'180', N'1', N'0', N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'302', N'FILTRO HEMILISADOR', N'BIOMETRIX', N'un', N'MT', N'NÃO CONTROLADO', N'1', N'2', N'0', N'0         ', N'90', N'1165', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'303', N'SONDA DE FOLEY Nº14', N'SOLIDOR', N'4', N'MT', N'NÃO CONTROLADO', N'1', N'6', N'0', N'0         ', N'90', N'1222', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'304', N'TUBO ENDOTRAQUEAL Nº8', N'SOLIDOR', N'1', N'MT', N'NÃO CONTROLADO', N'0', N'0', N'0', N'0         ', N'0', N'1', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'305', N'TUBO ENDOTRAQUEAL Nº9', N'MEDTRAQUEAL', N'', N'MT', N'NÃO CONTROLADO', N'1', N'4', N'0', N'0         ', N'90', N'1', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'306', N'TUBO ENDOTRAQUEAL Nº8,5', N'MEDTRAQUEAL', N'un', N'MT', N'NÃO CONTROLADO', N'1', N'2', N'0', N'0         ', N'90', N'1', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'307', N'TUBO ENDOTRAQUEAL Nº3,5', N'SOLIDOR', N'un', N'MT', N'NÃO CONTROLADO', N'1', N'2', N'0', N'0         ', N'90', N'1', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'308', N'TUBO ENDOTRAQUEAL Nº6', N'SOLIDOR', N'un', N'MT', N'NÃO CONTROLADO', N'1', N'2', N'0', N'0         ', N'90', N'1', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'309', N'TUBO ENDOTRAQUEAL Nº4,5', N'SOLIDOR', N'un', N'MT', N'NÃO CONTROLADO', N'1', N'2', N'0', N'0         ', N'90', N'1', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'310', N'TUBO ENDOTRAQUEAL Nº7', N'SOLIDOR', N'un', N'MT', N'NÃO CONTROLADO', N'1', N'2', N'0', N'0         ', N'90', N'1', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'311', N'TUBO ENDOTRAQUEAL Nº5', N'SOLIDOR', N'un', N'MT', N'NÃO CONTROLADO', N'1', N'2', N'0', N'0         ', N'90', N'1', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'312', N'SERINGA HIPODERMICA 5ML COM AGULHA', N'INJEX', N'un', N'MT', N'NÃO CONTROLADO', N'30', N'90', N'0', N'0         ', N'30', N'1073', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'313', N'MASCARA DE VENTURE ADULTO', N'SMITHS MEDICAL', N'un', N'MT', N'NÃO CONTROLADO', N'1', N'5', N'0', N'0         ', N'120', N'5', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'314', N'MASCARA DE VENTURE INFANTIL', N'SMITHS MEDICAL', N'un', N'MT', N'NÃO CONTROLADO', N'1', N'5', N'0', N'0         ', N'120', N'6', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'315', N'OXIMETRO DE PULSO', N'BEIJING CHOICE', N'un', N'MT', N'NÃO CONTROLADO', N'1', N'5', N'0', N'0         ', N'0', N'7', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'316', N'VALVULA REGULADORA P OXIGENIO', N'MILEC', N'un', N'MT', N'NÃO CONTROLADO', N'1', N'5', N'0', N'0         ', N'0', N'8', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'317', N'KIT CANULAS GUEDEL N 1 A N 6', N'OXIGEL', N'un', N'MT', N'NÃO CONTROLADO', N'1', N'5', N'0', N'0         ', N'0', N'8', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'318', N'SONDA DE ASPIRACAO TRAQUEAL N6', N'MARKMED', N'un', N'MT', N'NÃO CONTROLADO', N'1', N'10', N'0', N'0         ', N'120', N'9', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'319', N'SONDA DE ASPIRACAO TRAQUEAL N14', N'MARKMED', N'un', N'MT', N'NÃO CONTROLADO', N'1', N'10', N'0', N'0         ', N'120', N'10000000', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'320', N'SONDA DE ASPIRACAO TRAQUEAL N12', N'MARKMED', N'un', N'MT', N'NÃO CONTROLADO', N'1', N'5', N'0', N'0         ', N'120', N'11000000', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'321', N'CATETER NASAL P O2 N 6', N'MARKMED', N'un', N'MT', N'NÃO CONTROLADO', N'1', N'5', N'0', N'0         ', N'120', N'12000000', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'322', N'FATOR VIII 1000 UI RECOMBINANTE', N'HEMOBRAS', N'UI', N'FT', N'NÃO CONTROLADO', N'10', N'100', N'1000', N'VIII1000R ', N'180', N'1', N'0', N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'323', N'AGULHA 25X0,70', N'INJEX', N'un', N'MT', N'NÃO CONTROLADO', N'30', N'100', N'0', N'0         ', N'90', N'1129', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'324', N'AGULHA 40X1,2', N'INJEX', N'un', N'MT', N'NÃO CONTROLADO', N'30', N'90', N'0', N'0         ', N'90', N'1050', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'325', N'ESCALPE INTRAVENOSO 21G', N'LAMEDID', N'un', N'MT', N'NÃO CONTROLADO', N'10', N'30', N'0', N'0         ', N'90', N'1066', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'326', N'CAPTOPRIL', N'BALM-LABOR', N'un', N'MD', N'NÃO CONTROLADO', N'30', N'0', N'0', N'0         ', N'90', N'1007', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'327', N'CLORIDRATO DE DOPAMINA', N'HIPOLABOR', N'un', N'MD', N'NÃO CONTROLADO', N'30', N'0', N'0', N'0         ', N'90', N'1015', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'328', N'DIAZEPAM', N'TEUTO', N'un', N'MD', N'NÃO CONTROLADO', N'30', N'0', N'0', N'0         ', N'90', N'1012', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'329', N'DICLOFENACO DIETILAMONIO', N'FARMAFLAN', N'gel', N'MD', N'NÃO CONTROLADO', N'1', N'0', N'0', N'0         ', N'90', N'1167', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'330', N'MALEATO DE DEXCLOFENIRAMINA', N'HYSTIN', N'comp', N'MD', N'NÃO CONTROLADO', N'30', N'0', N'0', N'0         ', N'90', N'1010', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'331', N'MALEATO DE DEXCLOFENIRAMINA', N'EMS', N'frasco', N'MD', N'NÃO CONTROLADO', N'1', N'0', N'0', N'0         ', N'90', N'1010', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'332', N'LIDOCAÍNA 2% GELEIA', N'LABCAINA', N'BISN', N'MD', N'NÃO CONTROLADO', N'1', N'0', N'0', N'0         ', N'90', N'1332', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'333', N'LIDOCAINA', N'LABCAINA', N'BISN', N'MD', N'NÃO CONTROLADO', N'1', N'0', N'0', N'0         ', N'90', N'1333', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'334', N'CLORIDRATO DE PROPRANOLOL 40MG', N'POLOL', N'comp', N'MD', N'NÃO CONTROLADO', N'30', N'0', N'0', N'0         ', N'90', N'1191', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'335', N'DIMENIDRINATO 100MG', N'DRAMIN', N'comp', N'MD', N'NÃO CONTROLADO', N'5', N'50', N'0', N'0         ', N'120', N'1279', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'336', N'HIDROCLOROTIAZIDA 25 MG', N'HIDROLESS', N'COMP', N'MD', N'NÃO CONTROLADO', N'30', N'90', N'0', N'0         ', N'0', N'1193', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'337', N'FATOR VIIIY 500 UI', N'GRIFOLS ', N'UI', N'FT', N'NÃO CONTROLADO', N'15', N'500', N'500', N'VIIIY500  ', N'180', N'10', N'0', N'3')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'338', N'SORO FISIOLOGICO BOLSA 250 ML', N'BBRAUN', N'un', N'MD', N'NÃO CONTROLADO', N'10', N'30', N'0', N'0         ', N'30', N'1074', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'339', N'SORO FISIOLOGICO BOLSA 250 ML', N'FRESENIUS', N'UN', N'MD', N'NÃO CONTROLADO', N'30', N'0', N'0', N'0         ', N'90', N'1077', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'340', N'FATOR VIIIY 500 UI', N'', N'UI', N'FT', N'NÃO CONTROLADO', N'30', N'0', N'500', N'VIIIY500  ', N'180', N'1', N'0', N'3')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'341', N'DIPIRONA SODICA AMPOLA 2ML', N'TEUTO', N'UN', N'MD', N'NÃO CONTROLADO', N'30', N'90', N'0', N'0         ', N'0', N'1013', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'342', N'FUROSEMIDA 10MG/ML', N'SANTISA', N'un', N'MD', N'NÃO CONTROLADO', N'30', N'90', N'0', N'0         ', N'0', N'1021', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'343', N'NALOXONA CLORIDRATO 0,4MG/ML', N'NALOXONA', N'un', N'MD', N'NÃO CONTROLADO', N'30', N'90', N'0', N'0         ', N'0', N'1040', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'344', N'DIPIRONA SODICA 500MG/ML GOTAS', N'MAXALGINA', N'un', N'MD', N'NÃO CONTROLADO', N'30', N'90', N'0', N'0         ', N'0', N'1120', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'345', N'IBUPROFENO 300MG', N'ALGY-FLANDERIL', N'UN', N'MD', N'NÃO CONTROLADO', N'10', N'90', N'0', N'0         ', N'0', N'1330', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'346', N'FATOR IX 250 UI', N'GRIFOLS', N'UI', N'FT', N'NÃO CONTROLADO', N'25', N'500', N'250', N'IX250     ', N'180', N'1001', N'0', N'2')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'347', N'FATOR IX 500 UI', N'GRIFOLS', N'UI', N'FT', N'NÃO CONTROLADO', N'25', N'500', N'500', N'IX500     ', N'180', N'1010', N'1010', N'2')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'348', N'SIMETICONA GTS', N'HIPOLABOR', N'un', N'MD', N'NÃO CONTROLADO', N'1', N'2', N'0', N'0         ', N'30', N'1', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'349', N'SORO FISIOLÓGICO 250 ML', N'FARMACE', N'UN', N'MD', N'NÃO CONTROLADO', N'10', N'30', N'0', N'0         ', N'30', N'1077', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'350', N'DIMENIDRINATO 25MG/ML PIRIDOXINA 5MG/ML GOTAS', N'DRAMIN B6', N'FRASCO', N'MD', N'NÃO CONTROLADO', N'0', N'0', N'0', N'0         ', N'90', N'1279', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'351', N'NIFEDIPINO 10 MG', N'NIFEDIPINO', N'COMPR', N'MD', N'NÃO CONTROLADO', N'10', N'30', N'0', N'0         ', N'30', N'1351', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'352', N'COMPLEXO PROTROMBINICO 500 UI', N'', N'UI', N'FT', N'NÃO CONTROLADO', N'10', N'50', N'500', N'BER500    ', N'180', N'1352', N'0', N'9')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'353', N'FITOMENADIONA VITAMINA K', N'VIT K', N'ampola', N'MD', N'NÃO CONTROLADO', N'0', N'0', N'0', N'0         ', N'90', N'1', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'354', N'BESILATO ANLODIPINO', N'ANLODIPINO', N'COMP', N'MD', N'NÃO CONTROLADO', N'10', N'20', N'0', N'0         ', N'35', N'1354', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'355', N'FATOR IX 1000UI', N'OCTAFARMA', N'UI', N'FT', N'NÃO CONTROLADO', N'10', N'50', N'1000', N'IX1000    ', N'180', N'1355', N'0', N'2')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'356', N'AGUA DESTILADA 500ML', N'HALEXISTAR', N'UN', N'MD', N'NÃO CONTROLADO', N'0', N'0', N'0', N'0         ', N'0', N'1356', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'357', N'GLICOSE 5% 250ML', N'GLICOSE 5%', N'FRASCO', N'MD', N'NÃO CONTROLADO', N'5', N'10', N'0', N'0         ', N'90', N'1357', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'358', N'HIDROCORTISONA 100 MG', N'CORTISONAL', N'UND', N'MD', N'NÃO CONTROLADO', N'30', N'90', N'0', N'0         ', N'30', N'1124', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'359', N'CLORIDRATO DE PROMETAZINA 25MG', N'PAMERGAN', N'compr', N'MD', N'NÃO CONTROLADO', N'5', N'50', N'0', N'0         ', N'0', N'1359', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'360', N'SORO FISIOLOGICO 0,9% 100ML', N'SORO FISIOLOGICO', N'FRASCO', N'MD', N'NÃO CONTROLADO', N'10', N'100', N'0', N'0         ', N'60', N'1360', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'361', N'CLORIDRATO DE RANITIDINA 25MG/ML', N'RANITIDINA', N'amp', N'MD', N'NÃO CONTROLADO', N'5', N'10', N'0', N'0         ', N'0', N'1361', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'362', N'BROMOPRIDA', N'BROMOPRIDA', N'amp', N'MD', N'NÃO CONTROLADO', N'5', N'50', N'0', N'0         ', N'0', N'1362', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'363', N'IBUPROFENO 400MG', N'IBUPROFENO0', N'UND', N'MD', N'NÃO CONTROLADO', N'10', N'90', N'0', N'0         ', N'10', N'1330', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'364', N'IBUPROFENO GOTAS 50MG/ML', N'IBUPROFENO', N'UND', N'MD', N'NÃO CONTROLADO', N'1', N'0', N'0', N'0         ', N'3', N'1330', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'365', N'CAPTOPRIL 12,5 MG', N'MARIOL', N'UN', N'MD', N'NÃO CONTROLADO', N'30', N'0', N'0', N'0         ', N'30', N'1365', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'366', N'AGUA DESTILADA 20ML', N'AGUA PARA INJEÇÃO', N'UN', N'MD', N'NÃO CONTROLADO', N'30', N'0', N'0', N'0         ', N'30', N'1366', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'367', N'FATOR IX 1000UI', N'GRIFOLS', N'UI', N'FT', N'NÃO CONTROLADO', N'20', N'500', N'1000', N'IX1000    ', N'180', N'1367', N'0', N'2')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'368', N'AGUA PARA INJEÇAO 250ML', N'AGUA PARA INJEÇAO', N'FRASCO', N'MD', N'NÃO CONTROLADO', N'0', N'0', N'0', N'0         ', N'0', N'1368', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'370', N'FATOR VIIIY  1.200 UI', N'CSL', N'UI', N'FT', N'NÃO CONTROLADO', N'30', N'90', N'1200', N'VIII1200  ', N'180', N'1', N'0', N'3')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'371', N'SORO FISIOLÓGICO 250 ML', N'EUROFARMA', N'un', N'MD', N'NÃO CONTROLADO', N'30', N'90', N'0', N'0         ', N'30', N'1077', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'372', N'FATOR VIIIY 1000 UI', N'GRIFOLS', N'UI', N'FT', N'NÃO CONTROLADO', N'20', N'100', N'1000', N'VIIIY1000 ', N'180', N'1282', N'0', N'3')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'373', N'FATOR VIIIY 500 UI PARA IMUNOTOLERANCIA', N'OCTAPHARMA', N'UI', N'FT', N'NÃO CONTROLADO', N'20', N'100', N'500', N'VIIIY500I ', N'180', N'1337', N'0', N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'374', N'FATOR VIIIY 250 UI PARA IMUNOTOLERANCIA', N'OCTAPHARMA', N'UI', N'FT', N'NÃO CONTROLADO', N'20', N'100', N'250', N'VIIIY250I ', N'180', N'1374', N'0', N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'375', N'FATOR VIIIY 1000 UI PARA IMUNOTOLERANCIA', N'OCTAPHARMA', N'UI', N'FT', N'NÃO CONTROLADO', N'20', N'100', N'1000', N'VIIIY1000I', N'180', N'1282', N'0', N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'376', N'SORO FISIOLOGICO 50ML', N'SORO FISIOLOGICO', N'FRASCO', N'MD', N'NÃO CONTROLADO', N'10', N'100', N'0', N'0         ', N'90', N'1376', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'377', N'HIDROCORTISONA 100MG', N'GLIOCORT', N'UND', N'MD', N'NÃO CONTROLADO', N'30', N'90', N'0', N'0         ', N'30', N'1124', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'378', N'AGUA DESTILADA 10 ML', N'SAMTEC', N'und', N'MD', N'NÃO CONTROLADO', N'30', N'0', N'0', N'          ', N'30', N'1113', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'379', N'FATOR VIIIY  2.400UI', N'CSL - HAEMATE', N'UI', N'FT', N'NÃO CONTROLADO', N'30', N'0', N'2400', N'VIIIY2400 ', N'180', N'1', N'0', N'3')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'380', N'FATOR XIII 250 UI', N'CSL', N'UI', N'FT', N'NÃO CONTROLADO', N'10', N'0', N'250', N'XIII250   ', N'180', N'1', N'0', N'4')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'381', N'FATOR VII 100 KUI RECOMBINANTE', N'NOVOSEVEN', N'KUI', N'FT', N'NÃO CONTROLADO', N'10', N'30', N'100000', N'VII100R   ', N'180', N'1', N'0', N'9')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'382', N'FATOR VII 250 KUI RECOMBINANTE', N'NOVOSEVEN', N'KUI', N'FT', N'NÃO CONTROLADO', N'10', N'30', N'250000', N'VII250R   ', N'180', N'1', N'0', N'9')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'383', N'FATOR VII 50 KUI RECOMBINANTE', N'NOVOSEVEN', N'KUI', N'FT', N'NÃO CONTROLADO', N'10', N'30', N'50000', N'VII50R    ', N'180', N'1', N'0', N'9')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'384', N'CLORIDRATO DE ONDANSETRONA', N'2MG/ML', N'AMP 2ML', N'MD', N'NÃO CONTROLADO', N'30', N'0', N'0', N'0         ', N'60', N'1384', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'385', N'teste', N'teste', N'amp', N'MT', NULL, N'5', N'50', N'0', N'0         ', N'15', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'386', N'teste', N'teset', NULL, NULL, NULL, N'0', N'0', N'0', N'0         ', N'0', NULL, NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'387', N'', N'', N'KITO', N'MT', NULL, N'5', N'15', N'0', N'0         ', N'90', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'388', N'COMPLEXO B POLIVITAMINICO', N'POLIVITAMINICO', N'AMPOLA', N'MD', NULL, N'0', N'20', N'0', N'0         ', N'90', N'0', N'0', N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'390', N'LOSARTANA POTÁSSICA 50MG', N'LOSARTANA', N'COMP', N'MD', NULL, N'30', N'60', N'0', N'0         ', N'90', N'1390', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'391', N'HISOCEL 500ML', N'HISOCEL', N'BOLSA', N'MD', NULL, N'1', N'5', N'0', N'0         ', N'90', N'1391', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'392', N'AC FOLICO 400 MCG + DEXTROALFATOCOFEROL 10 MG', N'DTN - FOL', N'CÁPSULA', N'MD', NULL, N'0', N'60', N'0', N'0         ', N'90', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'393', N'SUPL FERRO + AC FÓLICO', N'HEMO FOLIC', N'CÁPSULA', N'MD', NULL, N'0', N'60', N'0', N'0         ', N'90', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'394', N'AC FÓLICO 5MG + BISGLICINATO FERROSO 150 MG', N'FOLIFER', N'COMP', N'MD', NULL, N'0', N'60', N'0', N'0         ', N'90', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'395', N'SUPL AC FOLICO', N'4G FOLIC', N'CÁPSULA', N'MD', NULL, N'0', N'60', N'0', N'0         ', N'90', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'396', N'AC FÓLICO 5MG', N'FEMME FOLICO', N'COMP', N'MD', NULL, N'0', N'60', N'0', N'0         ', N'90', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'397', N'FUROSEMIDA 40MG', N'FUROSEMIDA', N'COMP', N'MD', NULL, N'0', N'60', N'0', N'0         ', N'90', N'1397', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'398', N'FERRO BISGLICINATO QUELATO', N'AMOSTRA GRATIS', N'COMP', N'MD', NULL, N'5', N'20', N'0', N'0         ', N'60', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'399', N'BISGLICINATO FERROSO PRO', N'AMOSTRA GRATIS', N'CAP', N'MD', NULL, N'4', N'20', N'0', N'0         ', N'60', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'400', N'OLMESARTANA 40MG + ANLODIPINO 5MG', N'OLMESARTANA + ANLODIPINO', N'COMPR', N'MD', NULL, N'5', N'10', N'0', N'0         ', N'90', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'401', N'LANSOPRAZOL 30MG', N'LANSOPRAZOL', N'COMPR', N'MD', NULL, N'5', N'10', N'0', N'0         ', N'90', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'402', N'NIFEDIPINO 20 MG', N'NIFEDIPINO', N'COMPR', N'MD', NULL, N'5', N'10', N'0', N'0         ', N'90', N'1351', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'403', N'DIMENIDRINATO 3MG/ML E.V.', N'DRAMIN E.V.', N'AMP', N'MD', NULL, N'5', N'30', N'0', N'0         ', N'180', N'1279', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'404', N'DEXCLOFENIRAMINA 0,4MG/ML', N'', N'FRASCO', N'MD', NULL, N'0', N'100', N'0', N'0         ', N'90', N'0', NULL, N'9')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'405', N'CETOPROFENO 100MG / IV', N'', N'FRASCO', N'MD', NULL, N'0', N'100', N'0', N'0         ', N'90', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'406', N'CETOPROFENO 50 MG / IM', N'', N'AMPOLA', N'MD', NULL, N'0', N'100', N'0', N'0         ', N'90', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'407', N'CLORIDRATO DE ONDANSETRONA 8MG', N'8MG', N'20', N'MD', NULL, N'0', N'0', N'0', N'0         ', N'30', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'408', N'EMICIZUMABE 30MG/ML', N'HEMCIBRA 30MG/ML', N'MG', N'FT', NULL, N'0', N'100', N'30', N'EM30      ', N'180', N'0', NULL, N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'409', N'FATOR IX 1200UI', N'IMMUNINE', N'UI', N'FT', NULL, N'0', N'0', N'1200', N'IX1200    ', N'30', N'0', NULL, N'2')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'410', N'FATOR VIII-A-IT 1000 UI', N'ALPHANATE', N'UI', N'FT', NULL, N'0', N'500', N'1000', N'VIII1000  ', N'180', N'0', NULL, N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'411', N'FATOR VIII-A-IT 250 UI', N'ALPHANATE', N'UI', N'FT', NULL, N'0', N'500', N'250', N'VIII250   ', N'180', N'0', NULL, N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'412', N'FATOR VIII-A-IT 500 UI', N'ALPHANATE', N'UI', N'FT', NULL, N'0', N'500', N'500', N'VIII500   ', N'180', N'0', NULL, N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'413', N'ENALAPRIL 5MG', N'RENALAPRIL', N'20', N'MD', NULL, N'0', N'100', N'0', N'0         ', N'30', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'414', N'ECULIZUMAB 300MG (SOLIRIS)', N'SOLIRIS', N'300MG', N'HP', NULL, N'3', N'200', N'300', N'HPN300    ', N'30', N'0', NULL, N'14')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'415', N'ENALAPRIL 10 MG', N'10 MG', N'10MG', N'MD', NULL, N'10', N'90', N'0', N'0         ', N'30', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'416', N'FATOR VIII 1500UI RECOMBINANTE', N'HEMOBRAS', N'UI', N'FT', NULL, N'30', N'500', N'1500', N'VIII1500R ', N'30', N'0', NULL, N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'417', N'CLORIDRATO DE TRAMADOL 100MG/2ML', N'TRAMADOL', N'UNID', N'MD', NULL, N'30', N'90', N'0', N'0         ', N'30', N'0', NULL, N'11')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'418', N'CLORIDRATO DE METOCLOPRAMIDA 5MG/ML', N'METROFARMA', N'UND', N'MD', NULL, N'30', N'90', N'0', N'0         ', N'90', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'419', N'FATOR VIII-A-IT 1000UI', N'IMMUNATE - BAXALTA', N'UI', N'FT', NULL, N'30', N'500', N'1000', N'VIII1000  ', N'30', N'0', NULL, N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'420', N'FATOR VIII-A-IT 250UI', N'IMMUNATE - BAXALTA', N'UI', N'FT', NULL, N'30', N'5000', N'250', N'VIII250   ', N'30', N'0', NULL, N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'421', N'FATOR VIII-A-IT 500UI', N'IMMUNATE - BAXALTA', N'UI', N'FT', NULL, N'30', N'5000', N'500', N'VIII500   ', N'30', N'0', NULL, N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'422', N'PARACETAMOL 750MG', N'PARAMOL', N'COMP', N'MD', NULL, N'10', N'40', N'0', N'0         ', N'90', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'423', N'IBUPROFENO 600MG', N'IBUPROFENO', N'COMP', N'MD', NULL, N'30', N'100', N'0', N'0         ', N'30', N'0', NULL, N'9')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'424', N'FATOR VIIIY 250 UI', N'GRIFOLS', N'UI', N'FT', NULL, N'30', N'300', N'250', N'VIIIY250  ', N'30', N'0', NULL, N'3')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'425', N'ALFAVELAGLICERASE 400UI', N'VPRIV', N'400', N'GC', NULL, N'0', N'30', N'0', N'          ', N'120', N'0', NULL, N'10')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'426', N'LORATADINA 1MG/ML', N'LORATADINA', N'FRASCO', N'MD', NULL, N'0', N'0', N'0', N'0         ', N'30', N'0', NULL, N'9')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'427', N'ISOSSORBIDA 10MG', N'', N'COMP', N'MD', NULL, N'0', N'0', N'0', N'0         ', N'120', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'428', N'FATOR VIII-A-IT 500 UI', N'OCTAPHARMA', N'UI', N'FT', NULL, N'0', N'300', N'500', N'VIII500   ', N'120', N'0', NULL, N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'429', N'HIDRALAZINA . CLORIDRATO 20MG/ML', N'NEPRESOL', N'30', N'MD', NULL, N'10', N'30', N'0', N'0         ', N'30', N'0', NULL, N'9')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'430', N'CLORIDRATO DE ONDANSETRONA 2MG/ML', N'VONAU', N'AMP 4ML', N'MD', NULL, N'0', N'100', N'0', N'0         ', N'120', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'431', N'OMEPRAZOL 20MG', N'OMEPRAZOL', N'UN', N'MD', NULL, N'10', N'30', N'0', N'0         ', N'30', N'0', NULL, N'9')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'432', N'LORATADINA 10 MG', N'LORASLIV', N'COMP', N'MD', NULL, N'0', N'100', N'0', N'0         ', N'120', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'433', N'DICLORIDRATO DE MECLOZINA 25 MG', N'MECLIN JET', N'COMP', N'MD', NULL, N'0', N'100', N'0', N'0         ', N'120', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'434', N'EMICIZUMABE 60MG/0,4ML', N'HEMCIBRA', N'MG', N'FT', NULL, N'0', N'120', N'60', N'EM60      ', N'120', N'0', NULL, N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'435', N'FATOR IX 500UI', N'HEMOBRÁS', N'UI', N'FT', NULL, N'0', N'0', N'500', N'IX500     ', N'30', N'0', NULL, N'2')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'436', N'FATOR VIII 500UI', N'HEMOBRÁS (OCTO- TEC INFORMÁTICA LTDA)', N'UI', N'FT', NULL, N'0', N'0', N'500', N'VIII500   ', N'30', N'0', NULL, N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'437', N'MORFINA, SULFATO 10MG', N'DIMORF', N'COMP', N'MD', NULL, N'0', N'50', N'0', N'0         ', N'120', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'438', N'ETOMIDATO 2MG/ML', N'ETOMIDATO', N'AMP', N'MD', NULL, N'0', N'10', N'0', N'0         ', N'120', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'439', N'PREDNISOLONA, FOSFATO SODICO 3MG/ML', N'PREDNISOLONA XAROPE', N'FR', N'MD', NULL, N'0', N'300', N'0', N'0         ', N'120', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'440', N'PREDNISOLONA, FOSFATO SODICO 11 MG/ML', N'PREDNISOLONA GOTAS', N'FR', N'MD', NULL, N'0', N'300', N'0', N'0         ', N'120', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'441', N'SALBUTAMOL 100MCG/DOSE', N'AEROFRIN SPRAY', N'MCG', N'MD', NULL, N'1', N'30', N'0', N'0         ', N'30', N'0', NULL, N'9')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'442', N'EPINEFRINA (ADRENALINA)1MG/ML', N'HYFREN', N'UND', N'MD', NULL, N'30', N'90', N'0', N'0         ', N'30', N'0', NULL, N'9')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'443', N'LIDOCAÍNA GEL 2% (20MG/G)', N'LABCAÍNA', N'UND', N'MD', NULL, N'3', N'30', N'0', N'0         ', N'30', N'0', NULL, N'9')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'444', N'NITROPRUSSETO DE SÓDIO 25MG/ML', N'NITROP', N'UND', N'MD', NULL, N'30', N'90', N'0', N'0         ', N'30', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'445', N'LIDOCAÍNA 10MG/ML (1%)', N'HYPOCAÍNA', N'UND', N'MD', NULL, N'30', N'90', N'0', N'0         ', N'30', N'0', NULL, N'9')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'446', N'SUXAMETÔNIO (CLORETO) 100MG', N'SUCCITRAT', N'UND', N'MD', NULL, N'30', N'90', N'0', N'0         ', N'30', N'0', NULL, N'9')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'447', N'ONDANSETRONA 4MG', N'VONAU FLASH', N'COMP', N'MD', NULL, N'30', N'30', N'0', N'0         ', N'30', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'448', N'EMICIZUMABE 150MG/ML', N'HEMCIBRA 150MG/ML', N'MG', N'FT', NULL, N'1', N'30', N'150', N'EM150     ', N'30', N'0', NULL, N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'449', N'EMICIZUMABE 105MG/0,7ML', N'HEMCIBRA 105MG/0,7ML', N'MG', N'FT', NULL, N'0', N'200', N'105', N'EM105     ', N'120', N'0', NULL, N'1')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'450', N'ATENSINA (CLORIDRATO DE CLONIDINA) 0,100MG', N'', N'0,100MG', N'MD', NULL, N'30', N'90', N'0', N'0         ', N'30', N'0', NULL, N'9')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'451', N'OMEPRAZOL 40MG INJ', N'OMEPRAZOL 40 MG INJ', N'FR AMP', N'MD', NULL, N'0', N'120', N'0', N'0         ', N'120', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'452', N'SORO GLICOSADO 5% 250 ML', N'', N'FRC', N'MD', NULL, N'30', N'30', N'0', N'0         ', N'0', N'0', NULL, N'0')
GO

INSERT INTO [dbo].[tabMed] ([Codigo], [Descr], [Descr_Coml], [Und], [Tipo_Mat], [Tipo_Med], [Min], [Max], [UI_Cx], [CodBona], [AlertaVal], [numFicha], [GrpRelDir], [CodDiag]) VALUES (N'453', N'SORO GLICOFISIOLOGICO 500 ML', N'', N'FRC', N'MD', NULL, N'30', N'30', N'0', N'0         ', N'0', N'0', NULL, N'0')
GO

COMMIT
GO


-- ----------------------------
-- Primary Key structure for table tabMed
-- ----------------------------
ALTER TABLE [dbo].[tabMed] ADD CONSTRAINT [PK_tabMed] PRIMARY KEY CLUSTERED ([Codigo])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


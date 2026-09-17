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

 Date: 17/09/2026 12:03:29
*/


-- ----------------------------
-- Table structure for tabCadBoname
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[tabCadBoname]') AND type IN ('U'))
	DROP TABLE [dbo].[tabCadBoname]
GO

CREATE TABLE [dbo].[tabCadBoname] (
  [CodBona] nvarchar(10) COLLATE Latin1_General_CI_AS  NOT NULL,
  [Descr] varchar(100) COLLATE Latin1_General_CI_AS  NULL,
  [Qtde_UI] int  NULL,
  [CodDiag] smallint  NULL
)
GO

ALTER TABLE [dbo].[tabCadBoname] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of tabCadBoname
-- ----------------------------
BEGIN TRANSACTION
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'ACETA     ', N'ACETATO DESMPPRESSINA 0,4 MCG/ML                                                                 ', N'1', N'9')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'ACETA15   ', N'ACETATO DESMPPRESSINA 15 MCG/ML                                                                  ', N'1', N'9')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'ACID250   ', N'ACIDOTRANEXAMICO 250 MG                                                                             ', N'1', N'9')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'BER500    ', N'COMPLEXO PROTROMBINICO 500 UI                                                                       ', N'500', N'9')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'BER600    ', N'COMPLEXO PROTROMBINICO 600 UI                                                                       ', N'600', N'9')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'EM105', N'EMICIZUMABE 105MG/0,7ML', N'105', N'1')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'EM150', N'EMICIZUMABE 150MG/ML', N'150', N'1')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'EM30', N'EMICIZUMABE 30MG/ML', N'30', N'1')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'EM60', N'EMICIZUMABE 60MG/0,4ML', N'60', N'1')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'FEI1000   ', N'FEIBA 1000 UI                                                                                       ', N'1000', N'9')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'FEI2500   ', N'FEIBA 2500 UI                                                                                       ', N'2500', N'9')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'FEI500    ', N'FEIBA 500 UI                                                                                        ', N'500', N'9')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'GAU100    ', N'MIGLUSTATE 100 MG', N'100', N'10')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'GAU200    ', N'TALIGLUCERASE ALFA 200IU', N'200', N'10')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'GAU400    ', N'IMIGLUCERASE 400 UI', N'400', N'10')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'HPN300', N'ECULIZUMAB 300MG', N'300', N'14')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'IX1000    ', N'FATOR IX 1000UI                                                                                     ', N'1000', N'2')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'IX1200', N'FATOR IX 1200UI', N'1200', N'2')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'IX200     ', N'FATOR IX 200 UI                                                                                     ', N'200', N'2')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'IX250     ', N'FATOR IX 250 UI                                                                                     ', N'250', N'2')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'IX500     ', N'FATOR IX 500 UI                                                                                     ', N'500', N'2')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'IX600     ', N'FATOR IX 600 UI                                                                                     ', N'600', N'2')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'VII100R   ', N'FATOR VII 100 KUI RECOMBINANTE                                                                      ', N'100000', N'9')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'VII250R   ', N'FATOR VII 250 KUI RECOMBINANTE                                                                      ', N'250000', N'9')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'VII50R    ', N'FATOR VII 50 KUI RECOMBINANTE                                                                       ', N'50000', N'9')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'VIIA60    ', N'FATOR VII A                                                                                         ', N'60000', N'9')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'VIII1000  ', N'FATOR VIII 1000 UI                                                                                  ', N'1000', N'1')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'VIII1000R ', N'FATOR VIII 1000 UI Recombinante                                                                     ', N'1000', N'1')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'VIII1200  ', N'FATOR VIIIY 1200 UI                                                                                 ', N'1200', N'3')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'VIII1500R', N'FATOR VIII 1500UI RECOMBINANTE', N'1500', N'1')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'VIII250   ', N'FATOR VIII 250 UI                                                                                   ', N'250', N'1')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'VIII250R  ', N'FATOR VIII 250 UI Recombinante                                                                      ', N'250', N'1')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'VIII500   ', N'FATOR VIII 500 UI                                                                                   ', N'500', N'1')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'VIII500R  ', N'FATOR VIII 500 UI Recombinante                                                                      ', N'500', N'1')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'VIIIY1000 ', N'FATOR VIIIY 1000 UI                                                                                 ', N'1000', N'1')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'VIIIY1000I', N'FATOR VIIIY 1000 UI IMUNOTOLERANCIA                                                                 ', N'1000', N'1')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'VIIIY2400 ', N'FATOR VIIIY 2400 UI                                                                                 ', N'2400', N'3')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'VIIIY250  ', N'FATOR VIIIY 250 UI                                                                                  ', N'250', N'3')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'VIIIY250I ', N'FATOR VIIIY 250 UI IMUNOTOLERANCIA                                                                  ', N'250', N'1')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'VIIIY450  ', N'FATOR VIIIY 450 UI                                                                                  ', N'450', N'3')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'VIIIY500  ', N'FATOR VIIIY 500 UI                                                                                  ', N'500', N'3')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'VIIIY500I ', N'FATOR VIIIY 500 UI IMUNOTOLERANCIA                                                                  ', N'500', N'1')
GO

INSERT INTO [dbo].[tabCadBoname] ([CodBona], [Descr], [Qtde_UI], [CodDiag]) VALUES (N'XIII250   ', N'FATOR XIII 250                                                                                      ', N'250', N'4')
GO

COMMIT
GO


-- ----------------------------
-- Primary Key structure for table tabCadBoname
-- ----------------------------
ALTER TABLE [dbo].[tabCadBoname] ADD CONSTRAINT [PK_tabCadBoname] PRIMARY KEY CLUSTERED ([CodBona])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  
ON [PRIMARY]
GO


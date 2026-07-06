-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: devisdb
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `app_user`
--

DROP TABLE IF EXISTS `app_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `activate` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `last_login_at` date DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `nb_siret` varchar(255) DEFAULT NULL,
  `adresse` varchar(255) DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `telephone` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_user`
--

LOCK TABLES `app_user` WRITE;
/*!40000 ALTER TABLE `app_user` DISABLE KEYS */;
INSERT INTO `app_user` VALUES (6,NULL,'2026-06-29 14:41:48.065775','laurent.dumas@gmail.com',NULL,'$2a$10$.TXoF5EBC2AG/6WIqynu6.ZfHs11sOiBGNLql3dSPo1TY23DLZ0fi','laurent dumas','','3 Rue de la République','/uploads/photos/user_6_60db213c-6be7-427c-ab50-14d50bd57e66.png','0652014584'),(7,NULL,'2026-06-30 17:11:42.638211','davy.thiebaut.74@gmail.com',NULL,'$2a$10$9khR8nCQHGOqMseQm3QHmevbUMcvw6KjH9dPDh71QkstWPiZLy8U2',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `app_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `client`
--

DROP TABLE IF EXISTS `client`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `client` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `entreprise` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `telephone` varchar(255) DEFAULT NULL,
  `ville` varchar(255) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKdn5jasds5r1j3ewo5k3nhwkkq` (`name`),
  KEY `FKqqdwacidjq73vuxpn95i63b5d` (`user_id`),
  CONSTRAINT `FKqqdwacidjq73vuxpn95i63b5d` FOREIGN KEY (`user_id`) REFERENCES `app_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client`
--

LOCK TABLES `client` WRITE;
/*!40000 ALTER TABLE `client` DISABLE KEYS */;
INSERT INTO `client` VALUES (1,'e.eira@thefatrat.fr','TheFatRat','Ely Eira','06 07 15 32 41','Lyon',7),(2,'j.yosef@yohio.fr','YOHIO','Jim Yosef','06 84 69 48 05','Bordeaux',6),(3,'a.wallace@starrysky.fr','Starrysky','Amy Wallace','06 16 43 91 56','Lille',6),(4,'d.duke@ethernia.fr','Ethernia','Derek Duke','06 79 14 65 15','Strasbourg',6),(5,'l.colette@amaranth.fr','Amaranth','Lola Colett','06 98 15 76 25','Annecy',6),(6,'a.serena@disturbed.fr','Disturbed','Ashley Serena','06 41 64 51 02','Paris',6),(7,'j.jungkook@alestorm.fr','Alestorm','Jennie Jungkook','06 02 51 54 21','Rennes',6),(8,'a.santamaria@bilskirnir.fr','Bilskirnir','Andrea Santamaria','06 69 54 61 13','Lille',6),(10,'m.jordan@ashnikko.fr','Ashnikko','Morgane Jordan','03 06 67 06 54','Montpellier',6),(11,'t.martin@nexaflow.fr','NexaFlow','Thomas Martin','06 12 34 56 78','Paris',6),(12,'c.dubois@orbittech.fr','OrbitTech','Claire Dubois','06 23 45 67 89','Lyon',6),(13,'r.lefevre@skyforge.fr','SkyForge','Romain Lefèvre','06 34 56 78 90','Bordeaux',6),(14,'s.moreau@lumivox.fr','LumiVox','Sophie Moreau','06 45 67 89 01','Nantes',6),(15,'a.bernard@cryptonex.fr','CryptoNex','Antoine Bernard','06 56 78 90 12','Toulouse',6),(16,'e.petit@zenweb.fr','ZenWeb','Emma Petit','06 67 89 01 23','Strasbourg',6),(17,'m.rousseau@datastorm.fr','DataStorm','Marc Rousseau','06 78 90 12 34','Lille',6),(18,'l.garcia@pixelrise.fr','PixelRise','Laura Garcia','06 89 01 23 45','Montpellier',6),(19,'j.lambert@ironcloud.fr','IronCloud','Julien Lambert','06 90 12 34 56','Rennes',6),(20,'n.simon@ultracode.fr','UltraCode','Nathalie Simon','07 01 23 45 67','Grenoble',6),(21,'p.michel@vortexlab.fr','VortexLab','Pierre Michel','07 12 34 56 78','Nice',6),(22,'a.fontaine@bluenode.fr','BlueNode','Amélie Fontaine','07 23 45 67 89','Marseille',6),(23,'o.girard@pulsenet.fr','PulseNet','Olivier Girard','07 34 56 78 90','Nantes',6),(24,'c.bonnet@synthwave.fr','SynthWave','Céline Bonnet','07 45 67 89 01','Lyon',6),(25,'f.dupont@arcadiasys.fr','ArcadiaSys','François Dupont','07 56 78 90 12','Bordeaux',6),(26,'i.chevalier@novastep.fr','NovaStep','Isabelle Chevalier','07 67 89 01 23','Dijon',6),(27,'k.renard@gridpeak.fr','GridPeak','Kevin Renard','07 78 90 12 34','Reims',6),(28,'m.lemaire@cloudrift.fr','CloudRift','Marine Lemaire','07 89 01 23 45','Toulon',6),(29,'b.morin@apexdigital.fr','ApexDigital','Baptiste Morin','07 90 12 34 56','Clermont-Ferrand',6),(30,'v.colin@zenithsoft.fr','ZenithSoft','Valérie Colin','06 11 22 33 44','Angers',6);
/*!40000 ALTER TABLE `client` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devis`
--

DROP TABLE IF EXISTS `devis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devis` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `categorie` varchar(255) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `echeance` date DEFAULT NULL,
  `montant` int NOT NULL,
  `statut` varchar(255) DEFAULT NULL,
  `client_id` bigint DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK5e9ri93wudunww5t9eqenq0bp` (`client_id`),
  KEY `FK1rynbs87ap09wtg16my7vq0sh` (`user_id`),
  CONSTRAINT `FK1rynbs87ap09wtg16my7vq0sh` FOREIGN KEY (`user_id`) REFERENCES `app_user` (`id`),
  CONSTRAINT `FK5e9ri93wudunww5t9eqenq0bp` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devis`
--

LOCK TABLES `devis` WRITE;
/*!40000 ALTER TABLE `devis` DISABLE KEYS */;
INSERT INTO `devis` VALUES (1,'Site E-commerce','2025-08-27','2025-10-26',0,'Refusé',1,6),(2,'Refonte de site','2025-10-23','2025-12-26',0,'Accepté',1,6),(3,'Site vitrine','2026-04-06','2026-06-07',0,'En_cours',1,6),(4,'Site E-commerce','2025-07-16','2025-09-16',0,'En_attente',1,6),(5,'Refonte de site','2026-05-05','2026-07-04',0,'En_attente',2,6),(6,'Site E-commerce','2026-05-29','2026-08-19',0,'En_cours',2,6),(7,'Site vitrine','2026-02-15','2026-05-04',0,'Refusé',2,6),(8,'Maintenance de site','2025-09-20','2025-12-11',0,'En_cours',2,6),(9,'Maintenance de site','2025-09-18','2025-11-23',0,'Refusé',3,6),(10,'Maintenance de site','2025-08-17','2025-10-28',0,'Accepté',3,6),(11,'Site vitrine','2025-12-24','2026-03-13',0,'Refusé',3,6),(12,'Application web','2026-02-21','2026-05-09',0,'Accepté',4,6),(13,'Refonte de site','2025-08-10','2025-10-26',0,'Refusé',4,6),(14,'Référencement SEO','2026-05-13','2026-08-09',0,'Refusé',4,6),(15,'Site vitrine','2025-10-07','2025-12-28',0,'Accepté',4,6),(16,'Site vitrine','2025-10-25','2026-01-17',0,'Refusé',5,6),(17,'Application web','2025-10-28','2026-01-23',0,'Accepté',5,6),(18,'Site E-commerce','2025-11-20','2026-02-02',0,'Refusé',5,6),(19,'Refonte de site','2026-01-06','2026-03-18',0,'En_attente',5,6),(20,'Référencement SEO','2026-06-25','2026-09-22',0,'Accepté',6,6),(21,'Site E-commerce','2026-05-22','2026-07-26',0,'En_attente',6,6),(22,'Refonte de site','2026-02-22','2026-05-05',0,'Refusé',6,6),(23,'Site vitrine','2026-04-12','2026-06-18',0,'Refusé',7,6),(24,'Maintenance de site','2025-10-26','2026-01-20',0,'Accepté',7,6),(25,'Site E-commerce','2026-01-22','2026-03-31',0,'Accepté',7,6),(26,'Site E-commerce','2026-04-17','2026-07-14',0,'Refusé',7,6),(27,'Site E-commerce','2026-03-13','2026-05-24',0,'En_cours',8,6),(28,'Refonte de site','2025-11-13','2026-01-16',0,'En_attente',8,6),(29,'Refonte de site','2026-04-14','2026-06-30',0,'Refusé',8,6),(30,'Maintenance de site','2026-04-26','2026-07-08',0,'En_cours',8,6),(33,'Référencement SEO','2025-09-20','2025-12-14',0,'En_cours',10,6),(34,'Référencement SEO','2025-08-02','2025-10-13',0,'En_cours',10,6),(35,'Référencement SEO','2026-02-25','2026-05-12',0,'Refusé',10,6),(36,'Refonte de site','2025-07-06','2025-09-25',0,'Accepté',10,6),(37,'Site vitrine','2025-11-14','2026-02-06',0,'Refusé',11,6),(38,'Application web','2025-11-28','2026-02-09',0,'En_attente',11,6),(39,'Référencement SEO','2025-07-02','2025-09-30',0,'Refusé',11,6),(40,'Refonte de site','2025-09-30','2025-12-15',0,'Accepté',11,6),(41,'Site E-commerce','2026-05-24','2026-08-08',0,'En_attente',12,6),(42,'Référencement SEO','2026-01-08','2026-04-02',0,'En_attente',12,6),(43,'Référencement SEO','2026-03-29','2026-06-26',0,'Accepté',12,6),(44,'Maintenance de site','2026-03-08','2026-05-07',0,'Accepté',13,6),(45,'Site E-commerce','2025-12-05','2026-02-10',0,'Accepté',13,6),(46,'Site vitrine','2026-04-17','2026-07-16',0,'Accepté',13,6),(47,'Référencement SEO','2026-03-06','2026-05-31',0,'Accepté',14,6),(48,'Référencement SEO','2025-09-03','2025-11-06',0,'En_cours',14,6),(49,'Site E-commerce','2025-09-23','2025-11-30',0,'En_cours',14,6),(50,'Refonte de site','2026-04-03','2026-06-26',0,'En_attente',14,6),(51,'Application web','2026-01-21','2026-04-12',0,'Refusé',15,6),(52,'Site E-commerce','2026-03-22','2026-06-04',0,'Accepté',15,6),(53,'Site vitrine','2025-10-24','2025-12-25',0,'Refusé',15,6),(54,'Site vitrine','2026-04-10','2026-06-16',0,'En_attente',16,6),(55,'Site E-commerce','2025-08-06','2025-10-27',0,'Accepté',16,6),(56,'Maintenance de site','2025-08-04','2025-10-31',0,'Accepté',16,6),(57,'Maintenance de site','2025-08-06','2025-10-21',0,'En_attente',16,6),(58,'Refonte de site','2026-03-06','2026-05-11',0,'En_attente',17,6),(59,'Site E-commerce','2026-04-19','2026-07-06',0,'En_cours',17,6),(60,'Site E-commerce','2026-02-28','2026-05-24',0,'En_cours',17,6),(61,'Maintenance de site','2025-08-18','2025-10-20',0,'En_cours',17,6),(62,'Refonte de site','2026-01-27','2026-04-11',0,'Accepté',18,6),(63,'Site vitrine','2026-05-31','2026-08-19',0,'Accepté',18,6),(64,'Site vitrine','2026-01-23','2026-04-16',0,'Refusé',18,6),(65,'Site E-commerce','2025-10-07','2025-12-12',0,'En_cours',19,6),(66,'Application web','2026-02-02','2026-04-08',0,'Refusé',19,6),(67,'Site vitrine','2025-08-08','2025-10-21',0,'Accepté',20,6),(68,'Site vitrine','2026-05-30','2026-08-15',0,'Accepté',20,6),(69,'Application web','2025-09-24','2025-12-06',0,'En_cours',21,6),(70,'Site vitrine','2025-10-18','2026-01-13',0,'En_cours',21,6),(71,'Maintenance de site','2026-01-11','2026-03-12',0,'En_cours',22,6),(72,'Refonte de site','2026-02-18','2026-04-28',0,'En_cours',22,6),(73,'Site E-commerce','2026-04-11','2026-07-01',0,'En_cours',23,6),(74,'Site vitrine','2025-10-06','2025-12-14',0,'En_attente',23,6),(75,'Refonte de site','2026-04-23','2026-07-15',0,'Accepté',23,6),(76,'Référencement SEO','2025-12-08','2026-02-07',0,'Accepté',23,6),(77,'Site vitrine','2026-03-15','2026-06-12',0,'En_attente',24,6),(78,'Site vitrine','2026-03-18','2026-05-19',0,'En_attente',24,6),(79,'Application web','2026-05-01','2026-07-02',0,'En_attente',24,6),(80,'Référencement SEO','2026-04-18','2026-06-24',0,'Accepté',25,6),(81,'Maintenance de site','2025-08-11','2025-10-23',0,'Refusé',25,6),(82,'Site E-commerce','2026-06-08','2026-08-29',0,'Refusé',26,6),(83,'Refonte de site','2025-11-13','2026-01-24',0,'En_attente',26,6),(84,'Site vitrine','2025-12-01','2026-02-13',0,'Refusé',27,6),(85,'Site vitrine','2025-07-05','2025-09-17',0,'Accepté',27,6),(86,'Site E-commerce','2026-04-02','2026-06-07',0,'Refusé',27,6),(87,'Site E-commerce','2025-12-26','2026-03-24',0,'Accepté',27,6),(88,'Référencement SEO','2025-11-23','2026-01-27',0,'En_cours',28,6),(89,'Refonte de site','2026-06-26','2026-09-03',0,'Accepté',28,6),(90,'Site E-commerce','2026-04-10','2026-06-18',0,'Accepté',28,6),(91,'Refonte de site','2025-08-29','2025-11-25',0,'Accepté',29,6),(92,'Maintenance de site','2026-04-10','2026-06-13',0,'Refusé',29,6),(93,'Site E-commerce','2026-05-06','2026-07-11',0,'Refusé',29,6);
/*!40000 ALTER TABLE `devis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devis_prestation`
--

DROP TABLE IF EXISTS `devis_prestation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devis_prestation` (
  `devis_id` bigint NOT NULL,
  `prestation_id` bigint NOT NULL,
  PRIMARY KEY (`devis_id`,`prestation_id`),
  KEY `FK6sv0dvwiwjxqm4o5o42kg4as` (`prestation_id`),
  CONSTRAINT `FK6sv0dvwiwjxqm4o5o42kg4as` FOREIGN KEY (`prestation_id`) REFERENCES `prestation` (`id_prestation`),
  CONSTRAINT `FKo1muam3v0503vghkio5tiv3mt` FOREIGN KEY (`devis_id`) REFERENCES `devis` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devis_prestation`
--

LOCK TABLES `devis_prestation` WRITE;
/*!40000 ALTER TABLE `devis_prestation` DISABLE KEYS */;
INSERT INTO `devis_prestation` VALUES (2,1),(4,1),(6,1),(7,1),(9,1),(11,1),(12,1),(14,1),(15,1),(16,1),(18,1),(19,1),(20,1),(21,1),(22,1),(23,1),(26,1),(27,1),(28,1),(33,1),(34,1),(35,1),(36,1),(38,1),(39,1),(41,1),(42,1),(43,1),(45,1),(47,1),(48,1),(49,1),(50,1),(52,1),(54,1),(58,1),(59,1),(62,1),(63,1),(66,1),(69,1),(70,1),(72,1),(73,1),(74,1),(76,1),(78,1),(79,1),(80,1),(82,1),(84,1),(85,1),(86,1),(87,1),(88,1),(89,1),(90,1),(91,1),(1,2),(2,2),(4,2),(6,2),(11,2),(15,2),(16,2),(17,2),(21,2),(25,2),(26,2),(27,2),(37,2),(38,2),(45,2),(46,2),(51,2),(53,2),(54,2),(59,2),(63,2),(64,2),(65,2),(66,2),(67,2),(68,2),(73,2),(74,2),(77,2),(79,2),(85,2),(86,2),(1,3),(2,3),(4,3),(6,3),(7,3),(12,3),(15,3),(17,3),(18,3),(19,3),(21,3),(22,3),(23,3),(25,3),(26,3),(28,3),(29,3),(36,3),(38,3),(40,3),(41,3),(49,3),(51,3),(55,3),(58,3),(59,3),(60,3),(62,3),(64,3),(65,3),(68,3),(69,3),(72,3),(82,3),(83,3),(84,3),(89,3),(91,3),(17,4),(38,4),(69,4),(79,4),(1,6),(4,6),(7,6),(8,6),(10,6),(11,6),(12,6),(13,6),(15,6),(17,6),(18,6),(19,6),(22,6),(24,6),(25,6),(26,6),(30,6),(36,6),(44,6),(46,6),(49,6),(51,6),(52,6),(53,6),(55,6),(56,6),(57,6),(58,6),(60,6),(61,6),(65,6),(67,6),(68,6),(69,6),(70,6),(71,6),(72,6),(73,6),(75,6),(81,6),(82,6),(83,6),(84,6),(85,6),(89,6),(92,6),(93,6),(1,8),(4,8),(7,8),(8,8),(9,8),(10,8),(11,8),(12,8),(13,8),(14,8),(19,8),(20,8),(21,8),(22,8),(24,8),(27,8),(28,8),(29,8),(30,8),(33,8),(34,8),(35,8),(36,8),(37,8),(39,8),(40,8),(41,8),(42,8),(43,8),(44,8),(47,8),(48,8),(50,8),(51,8),(53,8),(55,8),(56,8),(57,8),(58,8),(60,8),(61,8),(62,8),(63,8),(64,8),(71,8),(75,8),(76,8),(77,8),(78,8),(79,8),(80,8),(81,8),(84,8),(85,8),(86,8),(87,8),(88,8),(89,8),(90,8),(91,8),(92,8),(93,8),(1,10),(4,10),(5,10),(6,10),(18,10),(25,10),(41,10),(49,10),(55,10),(59,10),(60,10),(65,10),(82,10),(86,10),(87,10),(93,10);
/*!40000 ALTER TABLE `devis_prestation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_token`
--

DROP TABLE IF EXISTS `password_reset_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_token` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `creat_at` datetime(6) NOT NULL,
  `expire_at` datetime(6) NOT NULL,
  `token_hash` varchar(128) NOT NULL,
  `used` bit(1) NOT NULL,
  `used_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKanlf8vm14i1nn7pa6qlp0xa3w` (`token_hash`),
  KEY `FKli7wollcmb8tibymo3s94o57h` (`user_id`),
  CONSTRAINT `FKli7wollcmb8tibymo3s94o57h` FOREIGN KEY (`user_id`) REFERENCES `app_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_token`
--

LOCK TABLES `password_reset_token` WRITE;
/*!40000 ALTER TABLE `password_reset_token` DISABLE KEYS */;
INSERT INTO `password_reset_token` VALUES (1,'2026-06-29 14:59:48.692928','2026-06-29 15:19:48.692928','3bce1c56c3559d080a6827b812417431561e07aaf3607424646c6fc74274d4cb',_binary '\0',NULL,6),(2,'2026-06-29 15:01:11.790771','2026-06-29 15:21:11.790771','40a2163a468147f4b80b6af4ea052d0805231cbea92d1f3f2dbb419f8d32c98a',_binary '','2026-06-29 15:02:25.762272',6),(3,'2026-06-30 15:15:26.303322','2026-06-30 15:35:26.303322','7725773ae7ccc06ccadc6fcc3d98bb00534c873f7708f3ce676ec8d2c5edd9ae',_binary '\0',NULL,6),(4,'2026-07-01 11:42:30.039038','2026-07-01 12:02:30.039038','5c1004f72b7354a20d8ea5280c9cd3452bc2be97d1ebfa2ea68da4d5ffb71e01',_binary '','2026-07-01 11:42:58.685770',7);
/*!40000 ALTER TABLE `password_reset_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prestation`
--

DROP TABLE IF EXISTS `prestation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prestation` (
  `id_prestation` bigint NOT NULL AUTO_INCREMENT,
  `intitule` varchar(255) DEFAULT NULL,
  `montant` int NOT NULL,
  `quantite` int NOT NULL,
  `devis_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id_prestation`),
  KEY `FK4sl0xuktrf86i0wjwd0wrxojj` (`devis_id`),
  CONSTRAINT `FK4sl0xuktrf86i0wjwd0wrxojj` FOREIGN KEY (`devis_id`) REFERENCES `devis` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prestation`
--

LOCK TABLES `prestation` WRITE;
/*!40000 ALTER TABLE `prestation` DISABLE KEYS */;
INSERT INTO `prestation` VALUES (1,'Analyse & Cadrage',400,10,1),(2,'Développement Back-end',800,15,1),(3,'Développement Front-end',600,15,1),(4,'Tableau de bord analytique',5,8,1),(6,'Tests & Recette',7,7,1),(8,'Déploiement & Documentation',9,4,1),(10,'Etude de marché (e-commerce)',600,12,1);
/*!40000 ALTER TABLE `prestation` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-06 16:24:33

-- phpMyAdmin SQL Dump
-- version 4.9.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 12, 2019 at 04:04 PM
-- Server version: 8.0.13
-- PHP Version: 7.3.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `auction_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `AuctionConfigs`
--

CREATE TABLE `AuctionConfigs` (
  `id` int(11) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `can_register` tinyint(1) NOT NULL,
  `is_open` tinyint(1) NOT NULL,
  `auction_url` varchar(255) NOT NULL,
  `max_users` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `AuctionSummaries`
--

CREATE TABLE `AuctionSummaries` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `final_price` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Catalogs`
--

CREATE TABLE `Catalogs` (
  `id` int(11) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `base_price` int(11) NOT NULL,
  `for_sale` tinyint(1) NOT NULL,
  `description` text NOT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Catalogs`
--

INSERT INTO `Catalogs` (`id`, `owner_id`, `name`, `quantity`, `base_price`, `for_sale`, `description`, `thumbnail_url`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'Car', 5, 100000, 0, 'Second hand cars in good condition.', NULL, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(2, 1, 'Bike', 3, 25000, 1, 'Newly 100cc bikes.', NULL, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(3, 1, 'Mobiles', 50, 45000, 1, 'Brand new iphone11 at cheapest price.', NULL, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(4, 1, 'D-link routers', 3, 899, 1, 'D-link 4 head routers.', NULL, '2019-11-12 00:00:00', '2019-11-12 00:00:00'),
(5, 1, 'Earphones', 23, 500, 0, 'Samsung level u pro.', NULL, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(6, 1, 'Watches', 100, 2000, 1, 'Mi 3 digital watches.', NULL, '2019-11-12 00:00:00', '2019-11-12 00:00:00'),
(7, 2, 'Laptops', 9, 30000, 0, 'Mackbook air 2017 13\'inch.', NULL, '2019-11-12 00:00:00', '2019-11-12 00:00:00'),
(8, 2, 'Keyboard', 13, 300, 1, 'Logitech wireless mechanical keyborads.', NULL, '2019-11-12 00:00:00', '2019-11-12 00:00:00'),
(9, 2, 'Shoes', 200, 1500, 1, 'Brand new adidas shoes at cheapest price ever.', NULL, '2019-11-12 00:00:00', '2019-11-12 00:00:00'),
(10, 2, 'Earpods', 5, 7000, 1, 'Apple Earpod pro.', NULL, '0000-00-00 00:00:00', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `Registrations`
--

CREATE TABLE `Registrations` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `auction_id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `SequelizeMeta`
--

CREATE TABLE `SequelizeMeta` (
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `SequelizeMeta`
--

INSERT INTO `SequelizeMeta` (`name`) VALUES
('20191107202814-create-user.js'),
('20191107204818-create-catalog.js'),
('20191107205812-create-auction-summary.js'),
('20191107210702-create-auction-config.js'),
('20191107212448-create-registration.js');

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `token` varchar(255) DEFAULT NULL,
  `balance` int(11) DEFAULT NULL,
  `role` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Users`
--

INSERT INTO `Users` (`id`, `name`, `password`, `token`, `balance`, `role`, `createdAt`, `updatedAt`) VALUES
(1, 'admin1', '21232f297a57a5a743894a0e4a801fc3', 'c0a07c4cb5fc035456fa0cb24cac1224', 0, 'Admin', '2019-11-12 15:01:23', '2019-11-12 15:38:23'),
(2, 'admin2', '21232f297a57a5a743894a0e4a801fc3', '157837640d48bed69e2934d24408d18b', 0, 'Admin', '2019-11-12 15:02:29', '2019-11-12 15:38:29');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `AuctionConfigs`
--
ALTER TABLE `AuctionConfigs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Indexes for table `AuctionSummaries`
--
ALTER TABLE `AuctionSummaries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `Catalogs`
--
ALTER TABLE `Catalogs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Indexes for table `Registrations`
--
ALTER TABLE `Registrations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `auction_id` (`auction_id`);

--
-- Indexes for table `SequelizeMeta`
--
ALTER TABLE `SequelizeMeta`
  ADD PRIMARY KEY (`name`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `AuctionConfigs`
--
ALTER TABLE `AuctionConfigs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `AuctionSummaries`
--
ALTER TABLE `AuctionSummaries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Catalogs`
--
ALTER TABLE `Catalogs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `Registrations`
--
ALTER TABLE `Registrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Users`
--
ALTER TABLE `Users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `AuctionConfigs`
--
ALTER TABLE `AuctionConfigs`
  ADD CONSTRAINT `auctionconfigs_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `AuctionSummaries`
--
ALTER TABLE `AuctionSummaries`
  ADD CONSTRAINT `auctionsummaries_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `auctionsummaries_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `catalogs` (`id`);

--
-- Constraints for table `Catalogs`
--
ALTER TABLE `Catalogs`
  ADD CONSTRAINT `catalogs_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `Registrations`
--
ALTER TABLE `Registrations`
  ADD CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `registrations_ibfk_2` FOREIGN KEY (`auction_id`) REFERENCES `auctionconfigs` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

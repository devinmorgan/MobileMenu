-- phpMyAdmin SQL Dump
-- version 4.5.2
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jan 14, 2016 at 12:49 AM
-- Server version: 10.1.9-MariaDB
-- PHP Version: 5.6.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mobile_menu2`
--

-- --------------------------------------------------------

--
-- Table structure for table `food_data`
--

CREATE TABLE `food_data` (
  `entry_number` int(11) NOT NULL,
  `food_identifier` varchar(10) NOT NULL,
  `person_identifier` varchar(10) NOT NULL,
  `is_interested` tinyint(1) NOT NULL,
  `date_recorded` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `food_data`
--

INSERT INTO `food_data` (`entry_number`, `food_identifier`, `person_identifier`, `is_interested`, `date_recorded`) VALUES
(32, 'x29XwEzDXc', 'fEutAhDCZE', 1, '2016-01-13 21:33:09'),
(33, 'WeeSypTZkR', 'fEutAhDCZE', 1, '2016-01-13 21:33:46'),
(34, '6zkawUjEZh', 'fEutAhDCZE', 1, '2016-01-13 21:33:50'),
(35, '92moUUNOT8', 'fEutAhDCZE', 1, '2016-01-13 21:33:52'),
(36, 'tzOvdXcdg0', 'fEutAhDCZE', 0, '2016-01-13 21:37:41'),
(37, 'pqDUjpGx67', 'fEutAhDCZE', 1, '2016-01-13 21:35:40'),
(38, 'UCDd8PLJT0', 'fEutAhDCZE', 1, '2016-01-13 21:37:23');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `food_data`
--
ALTER TABLE `food_data`
  ADD PRIMARY KEY (`entry_number`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `food_data`
--
ALTER TABLE `food_data`
  MODIFY `entry_number` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- Sample races
INSERT INTO race (race_name, location, race_date, description)
VALUES
    ('Pumpkin Town ThrowDown', 'RockFish Speedway', '2025-10-11', 'Fall festival race for all divisions!'),
    ('The Gobbler Gitty Up!', 'RockFish Speedway', '2025-11-01', 'Thanksgiving-themed showdown for racers.'),
    ('Winter Classic', 'Bloomington Speedway', '2026-01-10', 'Start the new year with the winter classic!');

-- Sample parents
INSERT INTO parent (first_name, last_name, email, password)
VALUES
    ('Ryan', 'Merrill', 'ryan@example.com', 'password'),
    ('Ashley', 'Davis', 'ashley@example.com', 'password');

-- Sample racers (these IDs will match parents)
INSERT INTO racer (first_name, last_name, age, car_number, parent_id)
VALUES
    ('Liam', 'Johnson', 3, '21', 1),
    ('Noah', 'Williams', 4, '14', 1),
    ('Olivia', 'Brown', 5, '7', 2),
    ('Ethan', 'Davis', 5, '88', 2),
    ('Lucas', 'White', 5, '9', 1);

-- Sample race results (using your new RaceResult table)
INSERT INTO race_result (race_id, racer_id, division, placement)
VALUES
    (1, 1, '3 Year Old Division', 1),
    (1, 2, '4 Year Old Division', 1),
    (1, 3, '5 Year Old Division', 1),
    (1, 4, 'Snack Pack Division', 1),
    (2, 1, '3 Year Old Division', 2),
    (2, 2, '4 Year Old Division', 2),
    (2, 3, '5 Year Old Division', 2),
    (2, 4, 'Snack Pack Division', 2);
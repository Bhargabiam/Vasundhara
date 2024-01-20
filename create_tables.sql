CREATE TABLE sales_data (
    sales_id VARCHAR(20) DEFAULT (
        'VDR_' || 
        to_char(current_timestamp, 'YYMMDDHH24MI') || 
        '_' || 
        LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')
    ) PRIMARY KEY,
    customer_id VARCHAR(20),
    second_mob VARCHAR(15),
    customer_type VARCHAR(10),
    metal_type VARCHAR(10),
    walkin_source VARCHAR(30),
    executive_id VARCHAR(30),
    associate_id VARCHAR(30),
    product_id VARCHAR(30),
    fm_name VARCHAR(30),
    current_status VARCHAR(40),
    non_conversion VARCHAR(40),
    remarks VARCHAR(255),
    sale_date DATE,
    visit_dates VARCHAR(255),
    end_date DATE
);

CREATE TABLE product_list (
    product_id VARCHAR(20) DEFAULT (
        'PROD_' || 
        to_char(current_timestamp, 'HH24MISS') || 
        '_' || 
        LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')
    ) PRIMARY KEY,
    product_name VARCHAR(30),
	status BOOLEAN
);

CREATE TABLE customer_in_process (
    process_id VARCHAR(20) DEFAULT (
        'VDR_' || 
        to_char(current_timestamp, 'YYMMDDHH24MI') || 
        '_' || 
        LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')
    ) PRIMARY KEY,
    customer_id VARCHAR(20),
    second_mob VARCHAR(15),
    customer_type VARCHAR(10),
    metal_type VARCHAR(10),
    walkin_source VARCHAR(30),
    executive_id VARCHAR(20),
    associate_id VARCHAR(20),
    product_id VARCHAR(20),
    fm_name VARCHAR(30),
    current_status VARCHAR(40),
    non_conversion VARCHAR(40),
    remarks VARCHAR(255),
    sale_date DATE,
	followup_date DATE,
    visit_dates VARCHAR(255),
	process_status BOOLEAN
);

CREATE TABLE executive_list (
    executive_id VARCHAR(20) DEFAULT (
        'EXUT_' || 
        to_char(current_timestamp, 'HH24MISS') || 
        '_' || 
        LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')
    ) PRIMARY KEY,
    executive_name VARCHAR(30),
	executive_status BOOLEAN
);

CREATE TABLE customer_details (
    customer_id VARCHAR(20) DEFAULT (
        'HYD_' || 
        to_char(current_timestamp, 'HH24MISS') || 
        '_' || 
        LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')
    ) PRIMARY KEY,
    customer_name VARCHAR(40),
	customer_mobile VARCHAR(15),
	customer_email VARCHAR(30),
	customer_address VARCHAR(30),
	customer_dob DATE
);


#!/usr/bin/env python3
"""
Simplified JobSpy-based job scraper for Vercel serverless functions
"""

import json
import logging
import pandas as pd
from jobspy import scrape_jobs
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class JobMarketScraper:
    """
    Simplified job scraper for serverless environments
    """
    
    SUPPORTED_SITES = [
        "indeed", 
        "linkedin", 
        "zip_recruiter", 
        "google", 
        "glassdoor"
    ]
    
    JOB_TYPES = ["fulltime", "parttime", "internship", "contract"]
    
    def __init__(self, verbose: int = 1, cache_enabled: bool = False):
        self.verbose = verbose
        # Disable caching in serverless environment
        self.cache_enabled = False
    
    def scrape_jobs(
        self,
        search_term: str,
        location: str = "",
        site_names: list = None,
        results_wanted: int = 20,
        job_type: str = None,
        is_remote: bool = None,
        hours_old: int = None,
        distance: int = 50,
        country_indeed: str = "USA",
        easy_apply: bool = None,
        description_format: str = "markdown",
        offset: int = 0,
        enforce_annual_salary: bool = True
    ) -> pd.DataFrame:
        """
        Scrape jobs from specified job boards
        """
        
        if site_names is None:
            site_names = ["indeed"]
        
        # Validate site names
        valid_sites = [site for site in site_names if site in self.SUPPORTED_SITES]
        if not valid_sites:
            valid_sites = ["indeed"]
        
        # Validate job type
        if job_type and job_type not in self.JOB_TYPES:
            job_type = None
        
        try:
            logger.info(f"🔍 Starting job scrape for '{search_term}' in '{location}'")
            logger.info(f"Sites: {valid_sites}, Results wanted: {results_wanted}")
            
            # Build scraping parameters
            scrape_params = {
                "site_name": valid_sites,
                "search_term": search_term,
                "location": location,
                "results_wanted": min(results_wanted, 50),  # Limit for serverless
                "distance": distance,
                "country_indeed": country_indeed,
                "description_format": description_format,
                "offset": offset,
                "verbose": self.verbose,
                "enforce_annual_salary": enforce_annual_salary
            }
            
            # Add optional parameters
            if job_type:
                scrape_params["job_type"] = job_type
            if is_remote is not None:
                scrape_params["is_remote"] = is_remote
            if hours_old is not None:
                scrape_params["hours_old"] = hours_old
            if easy_apply is not None:
                scrape_params["easy_apply"] = easy_apply
            
            # Scrape jobs
            jobs_df = scrape_jobs(**scrape_params)
            
            if jobs_df is not None and not jobs_df.empty:
                logger.info(f"✅ Successfully scraped {len(jobs_df)} jobs")
                
                # Add metadata
                jobs_df['scraped_at'] = datetime.now().isoformat()
                jobs_df['search_term'] = search_term
                jobs_df['search_location'] = location
                
                return jobs_df
            else:
                logger.warning("No jobs found")
                return pd.DataFrame()
                
        except Exception as e:
            logger.error(f"Error scraping jobs: {str(e)}")
            raise
    
    def format_jobs_for_api(self, df: pd.DataFrame) -> list:
        """
        Format job DataFrame for API response
        """
        if df.empty:
            return []
        
        def clean_value(value):
            """Clean pandas values for JSON serialization"""
            if pd.isna(value) or value is None:
                return None
            if isinstance(value, (int, float)) and pd.isna(value):
                return None
            if isinstance(value, str) and value.lower() in ['nan', 'none', '']:
                return None
            return value
        
        jobs = []
        for _, row in df.iterrows():
            job = {
                "id": f"{row.get('site', 'unknown')}_{hash(str(row.get('job_url', '')))}",
                "title": clean_value(row.get('title')) or '',
                "company": clean_value(row.get('company')) or '',
                "company_url": clean_value(row.get('company_url')),
                "location": {
                    "city": clean_value(row.get('city')) or '',
                    "state": clean_value(row.get('state')) or '',
                    "country": clean_value(row.get('country')) or '',
                    "full_location": clean_value(row.get('location')) or ''
                },
                "job_url": clean_value(row.get('job_url')),
                "is_remote": bool(row.get('is_remote', False)),
                "job_type": clean_value(row.get('job_type')),
                "description": clean_value(row.get('description')) or '',
                "salary": {
                    "min_amount": clean_value(row.get('min_amount')),
                    "max_amount": clean_value(row.get('max_amount')),
                    "interval": clean_value(row.get('interval')) or '',
                    "currency": clean_value(row.get('currency')) or 'USD'
                },
                "date_posted": clean_value(row.get('date_posted')) or '',
                "site": clean_value(row.get('site')) or 'unknown',
                "scraped_at": clean_value(row.get('scraped_at')) or '',
                "search_term": clean_value(row.get('search_term')) or '',
                "search_location": clean_value(row.get('search_location')) or '',
                "company_industry": clean_value(row.get('company_industry')),
                "job_level": clean_value(row.get('job_level')),
                "emails": clean_value(row.get('emails')) or [],
                "skills": clean_value(row.get('skills')) or []
            }
            jobs.append(job)
        
        return jobs
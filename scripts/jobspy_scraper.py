#!/usr/bin/env python3
"""
JobSpy-based job scraper for grant-guide job market
Scrapes jobs from multiple job boards using the JobSpy library
"""

import json
import logging
import os
import sys
import hashlib
import pickle
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Union
from functools import lru_cache
import pandas as pd
from jobspy import scrape_jobs
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class JobMarketScraper:
    """
    A comprehensive job scraper using JobSpy library
    Supports multiple job boards and flexible filtering with caching
    """
    
    SUPPORTED_SITES = [
        "indeed", 
        "linkedin", 
        "zip_recruiter", 
        "google", 
        "glassdoor",
        "bayt",
        "naukri",
        "bdjobs"
    ]
    
    JOB_TYPES = ["fulltime", "parttime", "internship", "contract"]
    
    def __init__(self, 
                 proxies: Optional[List[str]] = None, 
                 verbose: int = 1,
                 cache_enabled: bool = True,
                 cache_duration_hours: int = 6,
                 cache_dir: str = "job_cache"):
        """
        Initialize the job scraper
        
        Args:
            proxies: List of proxy servers in format ['user:pass@host:port', 'localhost']
            verbose: Verbosity level (0=errors only, 1=errors+warnings, 2=all logs)
            cache_enabled: Whether to enable caching
            cache_duration_hours: How long to cache results (in hours)
            cache_dir: Directory to store cache files
        """
        self.proxies = proxies or []
        self.verbose = verbose
        self.cache_enabled = cache_enabled
        self.cache_duration = timedelta(hours=cache_duration_hours)
        self.cache_dir = cache_dir
        
        # Create cache directory if it doesn't exist
        if self.cache_enabled:
            os.makedirs(self.cache_dir, exist_ok=True)
    
    def _generate_cache_key(self, **kwargs) -> str:
        """
        Generate a unique cache key based on search parameters
        
        Args:
            **kwargs: Search parameters
            
        Returns:
            Unique cache key string
        """
        # Sort parameters to ensure consistent key generation
        cache_params = {
            'search_term': kwargs.get('search_term', ''),
            'location': kwargs.get('location', ''),
            'site_names': sorted(kwargs.get('site_names', [])),
            'results_wanted': kwargs.get('results_wanted', 50),
            'job_type': kwargs.get('job_type'),
            'is_remote': kwargs.get('is_remote'),
            'hours_old': kwargs.get('hours_old'),
            'distance': kwargs.get('distance', 50),
            'country_indeed': kwargs.get('country_indeed', 'USA'),
            'easy_apply': kwargs.get('easy_apply'),
            'description_format': kwargs.get('description_format', 'markdown'),
            'enforce_annual_salary': kwargs.get('enforce_annual_salary', True)
        }
        
        # Create hash from parameters
        cache_string = json.dumps(cache_params, sort_keys=True)
        cache_hash = hashlib.md5(cache_string.encode()).hexdigest()
        
        return f"job_cache_{cache_hash}"
    
    def _get_cache_path(self, cache_key: str) -> str:
        """Get the full path for a cache file"""
        return os.path.join(self.cache_dir, f"{cache_key}.pkl")
    
    def _is_cache_valid(self, cache_path: str) -> bool:
        """Check if cache file exists and is still valid"""
        if not os.path.exists(cache_path):
            return False
        
        # Check if cache is expired
        cache_time = datetime.fromtimestamp(os.path.getmtime(cache_path))
        return datetime.now() - cache_time < self.cache_duration
    
    def _save_to_cache(self, cache_key: str, data: pd.DataFrame):
        """Save data to cache file"""
        if not self.cache_enabled:
            return
        
        try:
            cache_path = self._get_cache_path(cache_key)
            
            # Add cache metadata
            cache_data = {
                'data': data,
                'cached_at': datetime.now().isoformat(),
                'cache_key': cache_key
            }
            
            with open(cache_path, 'wb') as f:
                pickle.dump(cache_data, f)
            
            logger.info(f"💾 Cached {len(data)} jobs to {cache_key}")
            
        except Exception as e:
            logger.warning(f"Failed to save cache: {str(e)}")
    
    def _load_from_cache(self, cache_key: str) -> Optional[pd.DataFrame]:
        """Load data from cache file"""
        if not self.cache_enabled:
            return None
        
        try:
            cache_path = self._get_cache_path(cache_key)
            
            if not self._is_cache_valid(cache_path):
                return None
            
            with open(cache_path, 'rb') as f:
                cache_data = pickle.load(f)
            
            df = cache_data['data']
            logger.info(f"📄 Using cached data: {len(df)} jobs from {cache_data['cached_at']}")
            return df
            
        except Exception as e:
            logger.warning(f"Failed to load cache: {str(e)}")
            return None
    
    def clear_cache(self, older_than_hours: Optional[int] = None):
        """
        Clear cache files
        
        Args:
            older_than_hours: Only clear files older than specified hours (None = clear all)
        """
        if not self.cache_enabled or not os.path.exists(self.cache_dir):
            return
        
        cleared_count = 0
        current_time = datetime.now()
        
        for filename in os.listdir(self.cache_dir):
            if filename.startswith('job_cache_') and filename.endswith('.pkl'):
                file_path = os.path.join(self.cache_dir, filename)
                
                try:
                    if older_than_hours is not None:
                        file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
                        if current_time - file_time < timedelta(hours=older_than_hours):
                            continue
                    
                    os.remove(file_path)
                    cleared_count += 1
                    
                except Exception as e:
                    logger.warning(f"Failed to remove cache file {filename}: {str(e)}")
        
        logger.info(f"🗑️ Cleared {cleared_count} cache files")
    
    def get_cache_stats(self) -> Dict:
        """Get cache statistics"""
        if not self.cache_enabled or not os.path.exists(self.cache_dir):
            return {'total_files': 0, 'total_size_mb': 0, 'valid_files': 0}
        
        total_files = 0
        total_size = 0
        valid_files = 0
        
        for filename in os.listdir(self.cache_dir):
            if filename.startswith('job_cache_') and filename.endswith('.pkl'):
                file_path = os.path.join(self.cache_dir, filename)
                total_files += 1
                total_size += os.path.getsize(file_path)
                
                if self._is_cache_valid(file_path):
                    valid_files += 1
        
        return {
            'total_files': total_files,
            'valid_files': valid_files,
            'total_size_mb': round(total_size / (1024 * 1024), 2),
            'cache_dir': self.cache_dir,
            'cache_duration_hours': self.cache_duration.total_seconds() / 3600
        }
        
    def scrape_jobs(
        self,
        search_term: str,
        location: str = "",
        site_names: Optional[List[str]] = None,
        results_wanted: int = 50,
        job_type: Optional[str] = None,
        is_remote: Optional[bool] = None,
        hours_old: Optional[int] = None,
        distance: int = 50,
        country_indeed: str = "USA",
        easy_apply: Optional[bool] = None,
        linkedin_fetch_description: bool = False,
        google_search_term: Optional[str] = None,
        description_format: str = "markdown",
        offset: int = 0,
        enforce_annual_salary: bool = True
    ) -> pd.DataFrame:
        """
        Scrape jobs from specified job boards
        
        Args:
            search_term: Job search query
            location: Location to search in
            site_names: List of job boards to scrape from
            results_wanted: Number of results per site
            job_type: Type of job (fulltime, parttime, internship, contract)
            is_remote: Filter for remote jobs
            hours_old: Filter jobs by hours since posted
            distance: Search radius in miles
            country_indeed: Country for Indeed/Glassdoor searches
            easy_apply: Filter for easy apply jobs
            linkedin_fetch_description: Fetch full LinkedIn descriptions (slower)
            google_search_term: Specific search term for Google Jobs
            description_format: Format for job descriptions (markdown/html)
            offset: Start search from offset
            enforce_annual_salary: Convert wages to annual salary
            
        Returns:
            DataFrame containing scraped job data
        """
        
        if site_names is None:
            site_names = ["indeed", "linkedin", "zip_recruiter"]
        
        # Validate site names
        invalid_sites = [site for site in site_names if site not in self.SUPPORTED_SITES]
        if invalid_sites:
            logger.warning(f"Invalid site names: {invalid_sites}")
            site_names = [site for site in site_names if site in self.SUPPORTED_SITES]
        
        # Validate job type
        if job_type and job_type not in self.JOB_TYPES:
            logger.warning(f"Invalid job type: {job_type}. Must be one of {self.JOB_TYPES}")
            job_type = None
        
        try:
            # Generate cache key from all parameters
            cache_key = self._generate_cache_key(
                search_term=search_term,
                location=location,
                site_names=site_names,
                results_wanted=results_wanted,
                job_type=job_type,
                is_remote=is_remote,
                hours_old=hours_old,
                distance=distance,
                country_indeed=country_indeed,
                easy_apply=easy_apply,
                description_format=description_format,
                enforce_annual_salary=enforce_annual_salary
            )
            
            # Try to load from cache first
            if self.cache_enabled:
                cached_data = self._load_from_cache(cache_key)
                if cached_data is not None:
                    return cached_data
            
            logger.info(f"🔍 Starting job scrape for '{search_term}' in '{location}'")
            logger.info(f"Sites: {site_names}, Results wanted: {results_wanted}")
            
            # Build scraping parameters
            scrape_params = {
                "site_name": site_names,
                "search_term": search_term,
                "location": location,
                "results_wanted": results_wanted,
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
            if linkedin_fetch_description:
                scrape_params["linkedin_fetch_description"] = linkedin_fetch_description
            if google_search_term:
                scrape_params["google_search_term"] = google_search_term
            if self.proxies:
                scrape_params["proxies"] = self.proxies
            
            # Scrape jobs
            jobs_df = scrape_jobs(**scrape_params)
            
            if jobs_df is not None and not jobs_df.empty:
                logger.info(f"✅ Successfully scraped {len(jobs_df)} jobs")
                
                # Add metadata
                jobs_df['scraped_at'] = datetime.now().isoformat()
                jobs_df['search_term'] = search_term
                jobs_df['search_location'] = location
                
                # Save to cache
                if self.cache_enabled:
                    self._save_to_cache(cache_key, jobs_df)
                
                return jobs_df
            else:
                logger.warning("No jobs found")
                # Save empty result to cache to avoid repeated requests
                empty_df = pd.DataFrame()
                if self.cache_enabled:
                    self._save_to_cache(cache_key, empty_df)
                return empty_df
                
        except Exception as e:
            logger.error(f"Error scraping jobs: {str(e)}")
            raise
    
    def scrape_jobs_advanced(
        self,
        queries: List[Dict],
        save_to_file: bool = True,
        output_format: str = "json"
    ) -> Dict[str, pd.DataFrame]:
        """
        Scrape jobs for multiple queries and aggregate results
        
        Args:
            queries: List of query dictionaries with scraping parameters
            save_to_file: Whether to save results to file
            output_format: Output format (json, csv, excel)
            
        Returns:
            Dictionary mapping query names to DataFrames
        """
        results = {}
        
        for i, query in enumerate(queries):
            query_name = query.get('name', f'query_{i+1}')
            logger.info(f"Processing query: {query_name}")
            
            try:
                df = self.scrape_jobs(**{k: v for k, v in query.items() if k != 'name'})
                results[query_name] = df
                
                if save_to_file and not df.empty:
                    self._save_results(df, f"{query_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}", output_format)
                    
            except Exception as e:
                logger.error(f"Error processing query {query_name}: {str(e)}")
                results[query_name] = pd.DataFrame()
        
        return results
    
    def _save_results(self, df: pd.DataFrame, filename: str, format_type: str):
        """Save results to file"""
        output_dir = "job_scraping_results"
        os.makedirs(output_dir, exist_ok=True)
        
        filepath = os.path.join(output_dir, filename)
        
        if format_type.lower() == "csv":
            df.to_csv(f"{filepath}.csv", index=False, quoting=1, escapechar="\\")
        elif format_type.lower() == "excel":
            df.to_excel(f"{filepath}.xlsx", index=False)
        else:  # json
            df.to_json(f"{filepath}.json", orient="records", indent=2)
        
        logger.info(f"Results saved to {filepath}.{format_type}")
    
    def format_jobs_for_api(self, df: pd.DataFrame) -> List[Dict]:
        """
        Format job DataFrame for API response
        
        Args:
            df: Jobs DataFrame
            
        Returns:
            List of job dictionaries formatted for API
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
                # Additional fields that might be available
                "company_industry": clean_value(row.get('company_industry')),
                "job_level": clean_value(row.get('job_level')),
                "emails": clean_value(row.get('emails')) or [],
                "skills": clean_value(row.get('skills')) or []
            }
            jobs.append(job)
        
        return jobs

def main():
    """Example usage of the JobMarketScraper with caching"""
    scraper = JobMarketScraper(
        verbose=2, 
        cache_enabled=True, 
        cache_duration_hours=6
    )
    
    # Show cache stats
    print("=== Cache Stats ===")
    stats = scraper.get_cache_stats()
    print(f"Cache directory: {stats['cache_dir']}")
    print(f"Total cache files: {stats['total_files']}")
    print(f"Valid cache files: {stats['valid_files']}")
    print(f"Total size: {stats['total_size_mb']} MB")
    
    # Example 1: Simple job search (will cache result)
    print("\n=== First Job Search (will cache) ===")
    jobs_df = scraper.scrape_jobs(
        search_term="software engineer",
        location="San Francisco, CA",
        site_names=["indeed", "linkedin"],
        results_wanted=10,
        job_type="fulltime",
        hours_old=72
    )
    
    # Example 2: Same search (should use cache)
    print("\n=== Second Job Search (should use cache) ===")
    jobs_df_cached = scraper.scrape_jobs(
        search_term="software engineer",
        location="San Francisco, CA",
        site_names=["indeed", "linkedin"],
        results_wanted=10,
        job_type="fulltime",
        hours_old=72
    )
    
    if not jobs_df.empty:
        print(f"Found {len(jobs_df)} jobs")
        print(jobs_df[['title', 'company', 'location', 'site']].head())
        
        # Format for API
        api_jobs = scraper.format_jobs_for_api(jobs_df)
        print(f"\nFormatted {len(api_jobs)} jobs for API response")
    
    # Example 2: Multiple queries
    print("\n=== Multiple Queries ===")
    queries = [
        {
            "name": "sf_software_engineer",
            "search_term": "software engineer",
            "location": "San Francisco, CA",
            "site_names": ["indeed"],
            "results_wanted": 5,
            "job_type": "fulltime"
        },
        {
            "name": "remote_python_developer",
            "search_term": "python developer",
            "location": "",
            "site_names": ["linkedin"],
            "results_wanted": 5,
            "is_remote": True
        }
    ]
    
    results = scraper.scrape_jobs_advanced(queries, save_to_file=False)
    
    for query_name, df in results.items():
        print(f"{query_name}: {len(df)} jobs found")

if __name__ == "__main__":
    main()
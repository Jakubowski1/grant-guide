#!/usr/bin/env python3
"""
API Bridge for JobSpy scraper
This script is called by the Next.js API to perform job scraping
"""

import json
import sys
import os
from datetime import datetime

# Add the scripts directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from jobspy_scraper import JobMarketScraper

def main():
    try:
        # Get parameters from command line argument
        if len(sys.argv) < 2:
            print(json.dumps({
                "success": False,
                "error": "No parameters provided"
            }))
            sys.exit(1)
        
        params_json = sys.argv[1]
        params = json.loads(params_json)
        
        # Initialize scraper with caching enabled
        scraper = JobMarketScraper(
            verbose=1,  # Reduced verbosity for API
            cache_enabled=True,
            cache_duration_hours=6,  # Cache for 6 hours
            cache_dir="job_cache"
        )
        
        # Extract parameters
        search_term = params.get('search_term', '')
        location = params.get('location', '')
        site_names = params.get('site_names', ['indeed', 'linkedin'])
        results_wanted = params.get('results_wanted', 20)
        job_type = params.get('job_type')
        is_remote = params.get('is_remote')
        hours_old = params.get('hours_old')
        distance = params.get('distance', 50)
        country_indeed = params.get('country_indeed', 'USA')
        easy_apply = params.get('easy_apply')
        linkedin_fetch_description = params.get('linkedin_fetch_description', False)
        google_search_term = params.get('google_search_term')
        description_format = params.get('description_format', 'markdown')
        offset = params.get('offset', 0)
        enforce_annual_salary = params.get('enforce_annual_salary', True)
        
        # Cache management options
        force_refresh = params.get('force_refresh', False)
        cache_stats_only = params.get('cache_stats_only', False)
        clear_cache = params.get('clear_cache', False)
        
        # Handle cache management requests
        if cache_stats_only:
            stats = scraper.get_cache_stats()
            response = {
                "success": True,
                "cache_stats": stats,
                "scraped_at": datetime.now().isoformat()
            }
            print(json.dumps(response, default=str))
            return
        
        if clear_cache:
            scraper.clear_cache()
            response = {
                "success": True,
                "message": "Cache cleared successfully",
                "scraped_at": datetime.now().isoformat()
            }
            print(json.dumps(response, default=str))
            return
        
        # Temporarily disable cache if force refresh is requested
        if force_refresh:
            scraper.cache_enabled = False
        
        # Perform job scraping
        jobs_df = scraper.scrape_jobs(
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
            linkedin_fetch_description=linkedin_fetch_description,
            google_search_term=google_search_term,
            description_format=description_format,
            offset=offset,
            enforce_annual_salary=enforce_annual_salary
        )
        
        # Format results for API
        api_jobs = scraper.format_jobs_for_api(jobs_df)
        
        # Return success response
        response = {
            "success": True,
            "data": api_jobs,
            "count": len(api_jobs),
            "scraped_at": datetime.now().isoformat(),
            "cache_enabled": scraper.cache_enabled and not force_refresh,
            "cache_stats": scraper.get_cache_stats() if scraper.cache_enabled else None
        }
        
        print(json.dumps(response, default=str))
        
    except Exception as e:
        # Return error response
        error_response = {
            "success": False,
            "error": str(e),
            "scraped_at": datetime.now().isoformat()
        }
        print(json.dumps(error_response, default=str))
        sys.exit(1)

if __name__ == "__main__":
    main()
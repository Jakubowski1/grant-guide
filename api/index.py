#!/usr/bin/env python3
"""
Vercel serverless function for job scraping using JobSpy
This is the main entry point for the Python API endpoint
"""

import json
import logging
import traceback
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse
import sys
import os

# Configure logging for Vercel first
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add the current directory to Python path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from jobspy_scraper import JobMarketScraper
except ImportError as e:
    logger.error(f"Failed to import JobMarketScraper: {e}")
    # Fallback - we'll handle this in the handler
    JobMarketScraper = None

# Logger already configured above

class handler(BaseHTTPRequestHandler):
    """
    Main request handler for the job scraping API
    """
    
    def _set_cors_headers(self):
        """Set CORS headers for cross-origin requests"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Max-Age', '3600')
    
    def _send_json_response(self, data, status_code=200):
        """Send JSON response with proper headers"""
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self._set_cors_headers()
        self.end_headers()
        
        response_json = json.dumps(data, ensure_ascii=False, indent=2)
        self.wfile.write(response_json.encode('utf-8'))
    
    def _send_error_response(self, message, status_code=400, error_type="InvalidRequest"):
        """Send error response"""
        error_data = {
            "error": {
                "type": error_type,
                "message": message,
                "status_code": status_code
            }
        }
        self._send_json_response(error_data, status_code)
    
    def do_OPTIONS(self):
        """Handle preflight OPTIONS requests"""
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests with health check"""
        try:
            parsed_url = urlparse(self.path)
            
            if parsed_url.path == '/health' or parsed_url.path == '/':
                self._send_json_response({
                    "status": "healthy",
                    "service": "job-scraper-api",
                    "version": "1.0.0",
                    "supported_sites": ["indeed", "linkedin", "zip_recruiter", "google", "glassdoor"]
                })
                return
            
            # Parse query parameters for GET requests
            query_params = parse_qs(parsed_url.query)
            
            # Extract parameters
            search_term = query_params.get('search_term', [''])[0]
            location = query_params.get('location', [''])[0]
            
            if not search_term:
                self._send_error_response("Missing required parameter: search_term")
                return
            
            # Process the job scraping request
            self._process_scrape_request({
                'search_term': search_term,
                'location': location,
                'site_names': query_params.get('site_names', ['indeed']),
                'results_wanted': int(query_params.get('results_wanted', [20])[0]),
                'job_type': query_params.get('job_type', [None])[0],
                'is_remote': query_params.get('is_remote', [None])[0] == 'true' if query_params.get('is_remote', [None])[0] else None,
                'hours_old': int(query_params.get('hours_old', [0])[0]) if query_params.get('hours_old', [None])[0] else None,
                'distance': int(query_params.get('distance', [50])[0])
            })
            
        except Exception as e:
            logger.error(f"GET request error: {str(e)}")
            logger.error(traceback.format_exc())
            self._send_error_response(f"Internal server error: {str(e)}", 500, "InternalServerError")
    
    def do_POST(self):
        """Handle POST requests with job scraping"""
        try:
            # Get request body
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self._send_error_response("Empty request body")
                return
            
            post_data = self.rfile.read(content_length)
            
            try:
                request_data = json.loads(post_data.decode('utf-8'))
            except json.JSONDecodeError as e:
                self._send_error_response(f"Invalid JSON: {str(e)}")
                return
            
            # Process the job scraping request
            self._process_scrape_request(request_data)
            
        except Exception as e:
            logger.error(f"POST request error: {str(e)}")
            logger.error(traceback.format_exc())
            self._send_error_response(f"Internal server error: {str(e)}", 500, "InternalServerError")
    
    def _process_scrape_request(self, request_data):
        """Process job scraping request"""
        try:
            # Validate required parameters
            search_term = request_data.get('search_term', '').strip()
            if not search_term:
                self._send_error_response("Missing required parameter: search_term")
                return
            
            # Extract parameters with defaults
            location = request_data.get('location', '').strip()
            site_names = request_data.get('site_names', ['indeed'])
            results_wanted = min(int(request_data.get('results_wanted', 20)), 50)  # Limit for serverless
            job_type = request_data.get('job_type')
            is_remote = request_data.get('is_remote')
            hours_old = request_data.get('hours_old')
            distance = int(request_data.get('distance', 50))
            
            # Convert string boolean to actual boolean
            if isinstance(is_remote, str):
                is_remote = is_remote.lower() == 'true'
            
            logger.info(f"Processing scrape request: {search_term} in {location}")
            
            # Check if JobSpy is available
            if JobMarketScraper is None:
                self._send_error_response("JobSpy library not available - please check deployment", 500, "DependencyError")
                return
            
            # Initialize scraper
            scraper = JobMarketScraper(verbose=1)
            
            # Scrape jobs
            jobs_df = scraper.scrape_jobs(
                search_term=search_term,
                location=location,
                site_names=site_names,
                results_wanted=results_wanted,
                job_type=job_type,
                is_remote=is_remote,
                hours_old=hours_old,
                distance=distance
            )
            
            # Format jobs for API response
            jobs = scraper.format_jobs_for_api(jobs_df)
            
            # Send response
            response_data = {
                "success": True,
                "data": {
                    "jobs": jobs,
                    "total_results": len(jobs),
                    "search_params": {
                        "search_term": search_term,
                        "location": location,
                        "site_names": site_names,
                        "results_wanted": results_wanted,
                        "job_type": job_type,
                        "is_remote": is_remote,
                        "hours_old": hours_old,
                        "distance": distance
                    }
                }
            }
            
            self._send_json_response(response_data)
            
        except Exception as e:
            logger.error(f"Scraping error: {str(e)}")
            logger.error(traceback.format_exc())
            self._send_error_response(f"Scraping failed: {str(e)}", 500, "ScrapingError")
    
    def log_message(self, format, *args):
        """Override to use Python logging instead of stderr"""
        logger.info(f"{self.address_string()} - {format % args}")

# For Vercel compatibility
def handler_function(request):
    """
    Vercel handler function wrapper
    """
    return handler(request)
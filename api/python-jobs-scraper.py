from http.server import BaseHTTPRequestHandler
import json
import sys
import os
from urllib.parse import parse_qs

# Add the scripts directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'scripts'))

try:
    from jobspy_scraper import JobMarketScraper
except ImportError:
    JobMarketScraper = None

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Handle CORS
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()

            # Get request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                params = json.loads(post_data.decode('utf-8'))
            except json.JSONDecodeError:
                self.wfile.write(json.dumps({
                    "success": False,
                    "error": "Invalid JSON in request body"
                }).encode('utf-8'))
                return

            # Check if JobMarketScraper is available
            if JobMarketScraper is None:
                self.wfile.write(json.dumps({
                    "success": False,
                    "error": "JobSpy dependencies not available. Please install python-jobspy and dependencies."
                }).encode('utf-8'))
                return

            # Validate required parameters
            if not params.get('search_term'):
                self.wfile.write(json.dumps({
                    "success": False,
                    "error": "search_term is required"
                }).encode('utf-8'))
                return

            # Create scraper instance
            scraper = JobMarketScraper(
                verbose=1,
                cache_enabled=False  # Disable caching in serverless environment
            )

            # Extract parameters with defaults
            search_params = {
                'search_term': params['search_term'],
                'location': params.get('location', ''),
                'site_names': params.get('site_names', ['indeed']),
                'results_wanted': min(int(params.get('results_wanted', 20)), 50),  # Limit for serverless
                'job_type': params.get('job_type'),
                'is_remote': params.get('is_remote'),
                'hours_old': int(params['hours_old']) if params.get('hours_old') else None,
                'distance': int(params.get('distance', 50)),
                'country_indeed': params.get('country_indeed', 'USA'),
                'easy_apply': params.get('easy_apply'),
                'description_format': params.get('description_format', 'markdown'),
                'offset': int(params.get('offset', 0)),
                'enforce_annual_salary': params.get('enforce_annual_salary', True)
            }

            # Scrape jobs
            jobs_df = scraper.scrape_jobs(**search_params)
            
            # Format for API response
            if jobs_df is not None and not jobs_df.empty:
                jobs_list = scraper.format_jobs_for_api(jobs_df)
                
                response = {
                    "success": True,
                    "data": jobs_list,
                    "count": len(jobs_list),
                    "message": f"Successfully scraped {len(jobs_list)} jobs"
                }
            else:
                response = {
                    "success": True,
                    "data": [],
                    "count": 0,
                    "message": "No jobs found"
                }

            self.wfile.write(json.dumps(response).encode('utf-8'))

        except Exception as e:
            error_response = {
                "success": False,
                "error": f"Server error: {str(e)}"
            }
            self.wfile.write(json.dumps(error_response).encode('utf-8'))

    def do_OPTIONS(self):
        # Handle preflight CORS requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
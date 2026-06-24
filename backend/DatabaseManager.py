import os;
from supabase import create_client;

# This is to avoid the error if deployed as action from github
try:
  from dotenv import load_dotenv;
  load_dotenv();
except ImportError:
  pass

# load_dotenv and github will both popular environ.get so it doesn't matter here
supabase_url = os.environ.get("SUPABASE_URL");
supabase_key = os.environ.get("SUPABASE_KEY");
supabase = create_client(supabase_url,supabase_key);

def pushToDB(data):
  try:
    response = supabase.table("industry_heat").upsert(data, on_conflict="theme").execute()
  except Exception as e:
    print(f"Error pushing to Supabase: {e}");
    return None;    

def getFromDB():
  try:
    response = supabase.table("industry_heat").select("*").execute()
    return response.data  # returns a list of dicts
  except Exception as e:
    print(f"Error fetching from Supabase: {e}")
    return None
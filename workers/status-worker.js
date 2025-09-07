export default {
  async fetch(request, env, ctx) {
    // Define services to check
    const services = {
      home: 'https://ha.cjber.dev',
      storage: 'https://nas.cjber.dev',
      plex: 'https://plex.cjber.dev',
      request: 'https://req.cjber.dev'
    }
    
    // Check each service
    const statuses = {}
    const promises = Object.entries(services).map(async ([name, url]) => {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 3000) // 3 second timeout
        
        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          redirect: 'follow'
        })
        
        clearTimeout(timeout)
        // Consider any response as "online" - even 400/401/403 means service is responding
        // Only mark as offline if the request completely fails (network error, timeout)
        statuses[name] = true
      } catch (error) {
        statuses[name] = false
      }
    })
    
    await Promise.all(promises)
    
    // Return with CORS headers
    return new Response(JSON.stringify(statuses), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60' // Cache for 1 minute
      }
    })
  }
}
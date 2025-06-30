// Browser-Compatible PVPoke Repository Explorer
// Copy and paste this entire script into your browser console

(function() {
  'use strict';
  
  // Auto-detect current port from browser location
  const currentPort = window.location.port || '3005';
  const baseUrl = `http://localhost:${currentPort}/api/pvpoke-github`;
  
  const testPaths = [
    // GameMaster paths
    '/src/data/gamemaster.json',
    '/data/gamemaster.json', 
    '/src/gamemaster.json',
    '/gamemaster.json',
    '/src/data/pokemon.json',
    '/data/pokemon.json',
    '/src/js/gamemaster.js',
    
    // Rankings paths - Great League (1500)
    '/src/data/overall/1500/overall.json',
    '/data/overall/1500/overall.json',
    '/src/data/rankings/overall/1500/overall.json',
    '/data/rankings/overall/1500/overall.json',
    '/rankings/overall/1500/overall.json',
    '/src/rankings/overall/1500/overall.json',
    
    // Rankings paths - Ultra League (2500) 
    '/src/data/overall/2500/overall.json',
    '/data/overall/2500/overall.json',
    '/src/data/rankings/overall/2500/overall.json',
    '/data/rankings/overall/2500/overall.json',
    
    // Rankings paths - Master League (10000)
    '/src/data/overall/10000/overall.json',
    '/data/overall/10000/overall.json',
    '/src/data/rankings/overall/10000/overall.json',
    '/data/rankings/overall/10000/overall.json',
    
    // Directory exploration
    '/src/data/',
    '/data/',
    '/src/',
  ];

  async function testPath(path) {
    try {
      console.log(`🔍 Testing: ${baseUrl}${path}`);
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*'
        }
      });
      
      const statusEmoji = response.status === 200 ? '✅' : response.status === 404 ? '❌' : '⚠️';
      console.log(`   ${statusEmoji} Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type') || 'unknown';
        console.log(`   📄 Content-Type: ${contentType}`);
        
        try {
          if (contentType.includes('application/json')) {
            const data = await response.json();
            if (Array.isArray(data)) {
              console.log(`   📊 JSON Array with ${data.length} items`);
              if (data.length > 0) {
                console.log(`   🔍 Sample item keys: ${Object.keys(data[0]).slice(0, 5).join(', ')}`);
              }
            } else if (typeof data === 'object') {
              console.log(`   📊 JSON Object with keys: ${Object.keys(data).slice(0, 10).join(', ')}`);
              
              // Check for specific data structures
              if (data.pokemon) console.log(`   🐾 Contains pokemon data (${data.pokemon.length || Object.keys(data.pokemon).length} entries)`);
              if (data.moves) console.log(`   ⚔️ Contains moves data (${data.moves.length || Object.keys(data.moves).length} entries)`);
              if (data.itemTemplates) console.log(`   📦 Contains itemTemplates (${data.itemTemplates.length} templates)`);
            }
          } else {
            const text = await response.text();
            console.log(`   📝 Text content: ${text.length} characters`);
            if (text.length < 1000) {
              console.log(`   📄 Preview: ${text.substring(0, 200)}...`);
            }
          }
        } catch (parseError) {
          console.log(`   ⚠️ Could not parse response: ${parseError.message}`);
        }
      }
      
      console.log(''); // Empty line for readability
      return response.status === 200;
      
    } catch (error) {
      console.log(`   💥 Network Error: ${error.message}\n`);
      return false;
    }
  }

  async function explorePVPokeRepository() {
    console.log('🕵️ Starting PVPoke Repository Explorer...\n');
    console.log(`📍 Base URL: ${baseUrl}\n`);
    
    const results = {
      successful: [],
      failed: [],
      total: testPaths.length
    };
    
    for (const path of testPaths) {
      const success = await testPath(path);
      if (success) {
        results.successful.push(path);
      } else {
        results.failed.push(path);
      }
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📋 SUMMARY REPORT');
    console.log('='.repeat(50));
    console.log(`📊 Total paths tested: ${results.total}`);
    console.log(`✅ Successful: ${results.successful.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    
    if (results.successful.length > 0) {
      console.log('\n🎉 WORKING PATHS:');
      results.successful.forEach(path => console.log(`   ✅ ${path}`));
    }
    
    if (results.failed.length > 0) {
      console.log('\n💥 FAILED PATHS:');
      results.failed.forEach(path => console.log(`   ❌ ${path}`));
    }
    
    console.log('\n🏁 Exploration complete!');
    return results;
  }

  // Expose globally for easy access
  window.pvpokeExplorer = {
    explorePVPokeRepository: explorePVPokeRepository,
    testPath: testPath,
    baseUrl: baseUrl
  };
  
  console.log('🚀 PVPoke Repository Explorer loaded!');
  console.log(`📍 Auto-detected base URL: ${baseUrl}`);
  console.log('💡 Run pvpokeExplorer.explorePVPokeRepository() to start exploring!');
  
})(); 
// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { createClient } from '@/lib/supabase/client';
// import Link from 'next/link';
// import AIChat from '@/components/AIChat';
// import type { User, Session } from '@supabase/supabase-js';

// export default function WebAppPage() {
//   const [user, setUser] = useState<User | null>(null);
//   const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean>(false);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const router = useRouter();

//   useEffect(() => {
//     // Always scroll to top when this page loads
//     window.scrollTo({ top: 0, behavior: 'auto' });

//     const supabase = createClient();

//     const fetchUserData = async () => {
//       setIsLoading(true);

//       // Check session
//       const { data: { session }, error: sessionError } = await supabase.auth.getSession();

//       if (sessionError || !session || !session.user) {
//         console.warn('No active session found, redirecting to login');
//         router.push('/auth/login');
//         return;
//       }

//       // Fetch user data
//       const { data: { user: fetchedUser }, error: userError } = await supabase.auth.getUser();

//       if (userError || !fetchedUser) {
//         console.warn('User not found, redirecting to login');
//         router.push('/auth/login');
//         return;
//       }

//       if (!fetchedUser.email) {
//         console.warn('User email not found for authenticated user');
//         router.push('/account?message=user_error');
//         return;
//       }

//       // Check subscription status
//       const isSubscribed = await checkSubscriptionStatus(fetchedUser.email);

//       if (!isSubscribed) {
//         console.warn('No active subscription, redirecting to account');
//         router.push('/account?message=subscription_required');
//         return;
//       }

//       setUser(fetchedUser);
//       setHasActiveSubscription(isSubscribed);
//       setIsLoading(false);
//     };

//     fetchUserData().catch((error) => {
//       console.warn('Error in fetchUserData:', error.message);
//       router.push('/auth/login');
//     });

//     // Listen for auth state changes
//     const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
//       console.log('Auth event:', event, 'Session:', newSession);
//       if (event === 'SIGNED_OUT') {
//         setUser(null);
//         setHasActiveSubscription(false);
//         router.push('/auth/login');
//       } else if (event === 'SIGNED_IN' && newSession?.user) {
//         setUser(newSession.user);
//         checkSubscriptionStatus(newSession.user.email!).then((isSubscribed) => {
//           if (!isSubscribed) {
//             router.push('/account?message=subscription_required');
//           } else {
//             setHasActiveSubscription(true);
//           }
//         });
//       }
//     });

//     return () => {
//       subscription.unsubscribe();
//     };
//   }, [router]);

//   async function checkSubscriptionStatus(userEmail: string): Promise<boolean> {
//     const supabase = createClient();

//     try {
//       const { data: customer, error: customerError } = await supabase
//         .from('customers')
//         .select('customer_id')
//         .eq('email', userEmail)
//         .single();

//       if (customerError || !customer) {
//         console.warn('Customer not found for email:', userEmail);
//         return false;
//       }

//       const { data: subscriptions, error: subscriptionsError } = await supabase
//         .from('subscriptions')
//         .select('subscription_status')
//         .eq('customer_id', customer.customer_id)
//         .in('subscription_status', ['active', 'trialing']);

//       if (subscriptionsError) {
//         console.warn('Error checking subscriptions:', subscriptionsError.message);
//         return false;
//       }

//       return !!(subscriptions && subscriptions.length > 0);
//     } catch (error) {
//       console.warn('Error checking subscription status:', (error as Error).message);
//       return false;
//     }
//   }

//   if (isLoading || !user) {
//     return (
//       <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center transition-all duration-700">
//         <div className="text-xl text-gray-800 dark:text-gray-200">Loading...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white dark:bg-gray-950 transition-all duration-700">
//       <main className="relative">
//         {/* Hero Section */}
//         <section className="pt-8 pb-4 px-4 sm:px-6 lg:px-8">
//           <div className="max-w-7xl mx-auto">
//             <div className="text-center mb-8">
//               <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800/50 mb-6">
//                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2" />
//                 <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
//                   Premium AI Assistant Active
//                 </span>
//               </div>

//               <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
//                 Chat with{' '}
//                 <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
//                   Advanced AI
//                 </span>
//               </h1>

//               <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
//                 Experience the power of premium AI assistance. Ask questions, get insights, and unlock your
//                 productivity.
//               </p>
//             </div>
//           </div>
//         </section>

//         {/* AI Chat Section */}
//         <section className="pb-8 px-4 sm:px-6 lg:px-8">
//           <div className="max-w-5xl mx-auto">
//             <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6 flex flex-col min-h-[500px]">
//               <AIChat className="flex-1 w-full" userId={user.id} />
//             </div>
//           </div>
//         </section>

//         {/* Stats Section */}
//         <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
//           <div className="max-w-7xl mx-auto">
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
//               <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
//                 <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">
//                   99.9%
//                 </div>
//                 <p className="text-gray-700 dark:text-gray-400 font-medium">Uptime</p>
//               </div>
//               <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
//                 <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
//                   &lt;100ms
//                 </div>
//                 <p className="text-gray-700 dark:text-gray-400 font-medium">Response Time</p>
//               </div>
//               <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
//                 <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent mb-2">
//                   24/7
//                 </div>
//                 <p className="text-gray-700 dark:text-gray-400 font-medium">Support</p>
//               </div>
//             </div>
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// }

'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AccessibilityIssue {
  type: 'contrast' | 'alt_text' | 'semantic_html' | 'keyboard_navigation' | 'aria';
  element: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
  selector?: string;
}

interface ScanResult {
  url: string;
  issues: AccessibilityIssue[];
  score: number;
  timestamp: string;
}

export default function WebAppPage() {
  const [user, setUser] = useState<User | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [url, setUrl] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResults, setScanResults] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string>('');
  const [fixingIssue, setFixingIssue] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const [fixCode, setFixCode] = useState<{[key: string]: string}>({});
  const reportRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const supabase = createClient();
    const fetchUserData = async () => {
      setIsLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session || !session.user) {
        console.warn('No active session found, redirecting to login');
        router.push('/auth/login');
        return;
      }
      const { data: { user: fetchedUser }, error: userError } = await supabase.auth.getUser();
      if (userError || !fetchedUser) {
        console.warn('User not found, redirecting to login');
        router.push('/auth/login');
        return;
      }
      if (!fetchedUser.email) {
        console.warn('User email not found for authenticated user');
        router.push('/account?message=user_error');
        return;
      }
      const isSubscribed = await checkSubscriptionStatus(fetchedUser.email);
      if (!isSubscribed) {
        console.warn('No active subscription, redirecting to account');
        router.push('/account?message=subscription_required');
        return;
      }
      setUser(fetchedUser);
      setHasActiveSubscription(isSubscribed);
      setIsLoading(false);
    };
    fetchUserData().catch((error) => {
      console.warn('Error in fetchUserData:', error.message);
      router.push('/auth/login');
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('Auth event:', event, 'Session:', newSession);
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setHasActiveSubscription(false);
        router.push('/auth/login');
      } else if (event === 'SIGNED_IN' && newSession?.user) {
        setUser(newSession.user);
        checkSubscriptionStatus(newSession.user.email!).then((isSubscribed) => {
          if (!isSubscribed) {
            router.push('/account?message=subscription_required');
          } else {
            setHasActiveSubscription(true);
          }
        });
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    // Focus on the input field when the component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  async function checkSubscriptionStatus(userEmail: string): Promise<boolean> {
    const supabase = createClient();
    try {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('customer_id')
        .eq('email', userEmail)
        .single();
      if (customerError || !customer) {
        console.warn('Customer not found for email:', userEmail);
        return false;
      }
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('subscription_status')
        .eq('customer_id', customer.customer_id)
        .in('subscription_status', ['active', 'trialing']);
      if (subscriptionsError) {
        console.warn('Error checking subscriptions:', subscriptionsError.message);
        return false;
      }
      return !!(subscriptions && subscriptions.length > 0);
    } catch (error) {
      console.warn('Error checking subscription status:', (error as Error).message);
      return false;
    }
  }

  const extractJSONFromResponse = (text: string): ScanResult | null => {
    try {
      // Try to parse the entire response as JSON first
      return JSON.parse(text);
    } catch {
      try {
        // Try to extract JSON from code blocks
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          return JSON.parse(jsonMatch[1]);
        }
        
        // Try to find JSON object in the text
        const braceMatch = text.match(/\{[\s\S]*\}/);
        if (braceMatch) {
          return JSON.parse(braceMatch[0]);
        }
        
        return null;
      } catch {
        return null;
      }
    }
  };

  const runAccessibilityScan = async () => {
    if (!url) {
      setError('Please enter a valid URL');
      return;
    }
    setIsScanning(true);
    setError('');
    setScanResults(null);
    setFixCode({});
    
    // Get the current timestamp when the scan starts
    const scanTimestamp = new Date().toISOString();
    
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are an ADA/WCAG compliance scanner. Analyze the website at ${url} for accessibility issues. 
              Return a JSON object with this structure: 
              {
                "url": "${url}",
                "issues": [
                  {
                    "type": "contrast" | "alt_text" | "semantic_html" | "keyboard_navigation" | "aria",
                    "element": "selector or description of element",
                    "description": "description of the issue",
                    "severity": "low" | "medium" | "high",
                    "recommendation": "how to fix this issue",
                    "selector": "CSS selector if available"
                  }
                ],
                "score": 0-100,
                "timestamp": "current ISO timestamp"
              }
              Be thorough and identify as many issues as possible. Focus on WCAG 2.1 AA guidelines.`
            },
            {
              role: 'user',
              content: `Scan ${url} for ADA/WCAG compliance issues and provide a detailed report in JSON format.`
            }
          ]
        }),
      });
      if (!response.ok) {
        throw new Error(`Scan failed: ${response.statusText}`);
      }
      const data = await response.json();
      const jsonData = extractJSONFromResponse(data.content);
      if (jsonData) {
        // Override the timestamp with the real scan time
        jsonData.timestamp = scanTimestamp;
        setScanResults(jsonData);
      } else {
        // Create a fallback result if JSON parsing fails
        setScanResults({
          url,
          issues: [{
            type: 'contrast',
            element: 'Unknown',
            description: 'Scan completed but could not parse detailed results',
            severity: 'medium',
            recommendation: 'Please try again or check the URL',
          }],
          score: 0,
          timestamp: scanTimestamp, // Use the real scan time
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsScanning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      runAccessibilityScan();
    }
  };

  const applyFix = async (issue: AccessibilityIssue) => {
    if (!scanResults) return;
    
    const issueKey = `${issue.type}-${issue.element}`;
    
    if (fixCode[issueKey]) {
      return;
    }
    
    setFixingIssue(issue.element);
    
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are an accessibility fix generator. For the website at ${scanResults.url}, 
              generate code to fix this issue: ${issue.description}. 
              Return only the HTML/CSS/JS code needed to fix this issue, nothing else.`
            },
            {
              role: 'user',
              content: `Generate fix for: ${issue.description} on element: ${issue.element}`
            }
          ]
        }),
      });
      if (!response.ok) {
        throw new Error(`Fix generation failed: ${response.statusText}`);
      }
      const data = await response.json();
      
      setFixCode(prev => ({
        ...prev,
        [issueKey]: data.content
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate fix');
    } finally {
      setFixingIssue(null);
    }
  };

  const exportPDF = () => {
    setExporting('pdf');
    setTimeout(() => {
      window.print();
      setExporting(null);
    }, 500);
  };

  const exportMarkdown = () => {
    if (!scanResults) return;
    
    setExporting('markdown');
    
    let markdownContent = `# Web Accessibility Audit Report\n\n`;
    markdownContent += `**Application:** Moj APP - Web Accessibility Auditor\n`;
    markdownContent += `**Scanned URL:** ${scanResults.url}\n`;
    markdownContent += `**Scan Date:** ${new Date(scanResults.timestamp).toLocaleString()}\n`;
    markdownContent += `**Accessibility Score:** ${scanResults.score}/100\n\n`;
    
    markdownContent += `## Summary\n\n`;
    markdownContent += `| Severity | Count |\n`;
    markdownContent += `|----------|-------|\n`;
    
    const severityCounts = {
      high: scanResults.issues.filter(issue => issue.severity === 'high').length,
      medium: scanResults.issues.filter(issue => issue.severity === 'medium').length,
      low: scanResults.issues.filter(issue => issue.severity === 'low').length
    };
    
    markdownContent += `| High | ${severityCounts.high} |\n`;
    markdownContent += `| Medium | ${severityCounts.medium} |\n`;
    markdownContent += `| Low | ${severityCounts.low} |\n\n`;
    
    markdownContent += `## Detailed Issues\n\n`;
    
    scanResults.issues.forEach((issue, index) => {
      markdownContent += `### ${index + 1}. ${issue.element}\n\n`;
      markdownContent += `**Type:** ${issue.type}  \n`;
      markdownContent += `**Severity:** ${issue.severity}  \n`;
      markdownContent += `**Description:** ${issue.description}  \n`;
      markdownContent += `**Recommendation:** ${issue.recommendation}  \n\n`;
      
      if (issue.selector) {
        markdownContent += `**Selector:** \`${issue.selector}\`  \n\n`;
      }
    });
    
    markdownContent += `---\n*Report generated by Moj APP Web Accessibility Auditor*`;
    
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-report-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setExporting(null);
  };

  const exportCSV = () => {
    if (!scanResults) return;
    
    setExporting('csv');
    
    let csvContent = 'Moj APP - Web Accessibility Auditor\n';
    csvContent += `Scanned URL,${scanResults.url}\n`;
    csvContent += `Scan Date,${new Date(scanResults.timestamp).toLocaleString()}\n`;
    csvContent += `Accessibility Score,${scanResults.score}\n`;
    csvContent += '\n';
    
    // Summary section
    csvContent += 'SEVERITY SUMMARY\n';
    csvContent += 'Severity,Count\n';
    
    const severityCounts = {
      high: scanResults.issues.filter(issue => issue.severity === 'high').length,
      medium: scanResults.issues.filter(issue => issue.severity === 'medium').length,
      low: scanResults.issues.filter(issue => issue.severity === 'low').length
    };
    
    csvContent += `High,${severityCounts.high}\n`;
    csvContent += `Medium,${severityCounts.medium}\n`;
    csvContent += `Low,${severityCounts.low}\n`;
    csvContent += '\n';
    
    // Detailed issues
    csvContent += 'DETAILED ISSUES\n';
    csvContent += 'Number,Element,Type,Severity,Description,Recommendation,Selector\n';
    
    scanResults.issues.forEach((issue, index) => {
      csvContent += `${index + 1},"${issue.element}","${issue.type}","${issue.severity}","${issue.description.replace(/"/g, '""')}","${issue.recommendation.replace(/"/g, '""')}","${issue.selector || ''}"\n`;
    });
    
    csvContent += '\n';
    csvContent += 'Generated by Moj APP Web Accessibility Auditor';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setExporting(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getIssueTypeIcon = (type: string) => {
    switch (type) {
      case 'contrast': return '🎨';
      case 'alt_text': return '🖼️';
      case 'semantic_html': return '📝';
      case 'keyboard_navigation': return '⌨️';
      case 'aria': return '♿';
      default: return '❓';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Needs Improvement';
    return 'Poor';
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center transition-all duration-700">
        <div className="text-xl text-gray-800 dark:text-gray-200">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-all duration-700">
      <main className="relative">
        {/* Hero Section */}
        <section className="pt-8 pb-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800/50 mb-6">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Premium ADA/WCAG Scanner Active
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
                Website{' '}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Accessibility Scanner
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Scan any website for ADA/WCAG compliance issues. Get AI-powered recommendations and one-click fixes for accessibility problems.
              </p>
            </div>
          </div>
        </section>
        
        {/* Scanner Section */}
        <section className="pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <input
                  ref={inputRef}
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
                <button
                  onClick={runAccessibilityScan}
                  disabled={isScanning}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
                >
                  {isScanning ? 'Scanning...' : 'Scan Website'}
                </button>
              </div>
              {error && (
                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                  {error}
                </div>
              )}
              {scanResults && (
                <div className="mt-6 print-container" ref={reportRef}>
                  {/* Report Header */}
                  <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-blue-100 dark:border-gray-700">
                    <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">Moj APP</h1>
                    <h2 className="text-xl text-center text-gray-700 dark:text-gray-300 mb-6">Web Accessibility Auditor</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
                      <div>
                        <span className="font-semibold">Target URL:</span> {scanResults.url}
                      </div>
                      <div>
                        <span className="font-semibold">Scan Date:</span> {new Date(scanResults.timestamp).toLocaleString()}
                      </div>
                    </div>
                    
                    {/* Gauge Chart for Accessibility Score */}
                    <div className="flex flex-col items-center">
                      <div className="w-full max-w-md">
                        <div className="relative h-6 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mb-2">
                          {/* Color segments */}
                          <div className="absolute top-0 left-0 h-full w-1/3 bg-red-500"></div>
                          <div className="absolute top-0 left-1/3 h-full w-1/3 bg-yellow-500"></div>
                          <div className="absolute top-0 left-2/3 h-full w-1/3 bg-green-500"></div>
                          
                          {/* Score indicator */}
                          <div 
                            className="absolute top-0 h-6 w-1 bg-gray-900 dark:bg-gray-300 transition-all duration-1000 ease-out"
                            style={{ left: `${scanResults.score}%` }}
                          ></div>
                        </div>
                        
                        {/* Scale markers */}
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-4">
                          <span>0</span>
                          <span>25</span>
                          <span>50</span>
                          <span>75</span>
                          <span>100</span>
                        </div>
                        
                        {/* Score display */}
                        <div className="text-center">
                          <div className={`text-4xl font-bold ${getScoreColor(scanResults.score)}`}>
                            {scanResults.score}/100
                          </div>
                          <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                            {getScoreLabel(scanResults.score)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Export Options */}
                  <div className="mb-8 no-print">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Report</h3>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={exportPDF}
                        disabled={exporting === 'pdf'}
                        className="flex items-center px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg transition-colors"
                      >
                        {exporting === 'pdf' ? 'Preparing...' : '📄 PDF Export'}
                      </button>
                      <button
                        onClick={exportMarkdown}
                        disabled={exporting === 'markdown'}
                        className="flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg transition-colors"
                      >
                        {exporting === 'markdown' ? 'Preparing...' : '📝 Markdown Export'}
                      </button>
                      <button
                        onClick={exportCSV}
                        disabled={exporting === 'csv'}
                        className="flex items-center px-4 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg transition-colors"
                      >
                        {exporting === 'csv' ? 'Preparing...' : '📊 CSV Export'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Summary Statistics */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Summary</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/50">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {scanResults.issues.filter(issue => issue.severity === 'high').length}
                        </div>
                        <div className="text-sm text-red-700 dark:text-red-300">High Severity Issues</div>
                      </div>
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800/50">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          {scanResults.issues.filter(issue => issue.severity === 'medium').length}
                        </div>
                        <div className="text-sm text-yellow-700 dark:text-yellow-300">Medium Severity Issues</div>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {scanResults.issues.filter(issue => issue.severity === 'low').length}
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">Low Severity Issues</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Detailed Issues */}
                  {scanResults.issues.length === 0 ? (
                    <div className="p-6 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg text-center">
                      🎉 No accessibility issues found! This website is highly accessible.
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detailed Issues</h3>
                      <div className="space-y-4">
                        {scanResults.issues.map((issue, index) => {
                          const issueKey = `${issue.type}-${issue.element}`;
                          const hasFix = fixCode[issueKey];
                          
                          return (
                            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                              <div className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start space-x-3">
                                    <span className="text-2xl">{getIssueTypeIcon(issue.type)}</span>
                                    <div>
                                      <h3 className="font-medium text-gray-900 dark:text-white">{issue.element}</h3>
                                      <p className="text-gray-600 dark:text-gray-400 mt-1">{issue.description}</p>
                                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                                        <strong>Recommendation:</strong> {issue.recommendation}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end space-y-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                                      {issue.severity}
                                    </span>
                                    <button
                                      onClick={() => applyFix(issue)}
                                      disabled={fixingIssue === issue.element}
                                      className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors no-print"
                                    >
                                      {fixingIssue === issue.element ? 'Generating...' : hasFix ? 'Fix Generated' : 'Fix Issue'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Fix Code Display */}
                              {hasFix && (
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 border-t border-green-100 dark:border-green-800/50">
                                  <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Generated Fix:</h4>
                                  <pre className="p-3 bg-white dark:bg-gray-800 rounded text-sm overflow-x-auto">
                                    <code>{fixCode[issueKey]}</code>
                                  </pre>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50 no-print">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Why Accessibility Matters
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 text-center">
                <div className="text-3xl mb-4">👥</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Inclusive Design</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Ensure your website is usable by everyone, including people with disabilities.
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 text-center">
                <div className="text-3xl mb-4">⚖️</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Legal Compliance</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Meet ADA and WCAG requirements to avoid potential lawsuits and penalties.
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 text-center">
                <div className="text-3xl mb-4">📈</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Better SEO</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Accessible websites often rank higher in search results and reach a wider audience.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Print Styles for PDF Export */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
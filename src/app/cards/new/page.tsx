'use client'; // Make this a Client Component

import React, { useState, useEffect, useTransition } from 'react'; // Import useTransition
import Image from 'next/image';
import { addCardAction } from './actions'; // Import the action from the new file
import { searchCards, type CardWithBenefits } from '@/lib/cardSearchUtils';

// Helper arrays
const months = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
  { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
  { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i); // Last 10 years

// --- Sub-component for the card form with its own transition state ---
function PredefinedCardForm({ card, matchedFields }: { card: CardWithBenefits; matchedFields?: string[] }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      // Consider adding error handling or success feedback here if addCardAction returns status
      addCardAction(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit}> 
      <input type="hidden" name="predefinedCardId" value={card.id} />
      <div className="border rounded-lg p-4 shadow-md flex flex-col justify-between h-full bg-white dark:bg-gray-800 dark:border-gray-700 dark:shadow-lg dark:shadow-indigo-500/20">
        <div>
          {card.imageUrl && (
            <div className="relative h-40 w-full mb-4 rounded overflow-hidden">
              <Image
                src={card.imageUrl}
                alt={card.name}
                layout="fill"
                objectFit="contain"
                unoptimized
              />
            </div>
          )}
          <div className="flex items-start justify-between mb-2">
            <h2 className={`text-xl font-semibold dark:text-gray-100 ${matchedFields?.includes('name') ? 'bg-yellow-200 dark:bg-yellow-800 px-1 rounded' : ''}`}>
              {card.name}
            </h2>
            {matchedFields && matchedFields.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {matchedFields.map(field => (
                  <span key={field} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                    {field}
                  </span>
                ))}
              </div>
            )}
          </div>
          <p className={`text-gray-600 mb-1 dark:text-gray-300 ${matchedFields?.includes('issuer') ? 'bg-yellow-200 dark:bg-yellow-800 px-1 rounded' : ''}`}>
            Issuer: {card.issuer}
          </p>
          <p className={`text-gray-600 mb-2 dark:text-gray-300 ${matchedFields?.includes('annual fee') ? 'bg-yellow-200 dark:bg-yellow-800 px-1 rounded' : ''}`}>
            Annual Fee: ${card.annualFee}
          </p>
          
          {/* Show benefits preview */}
          {card.benefits && card.benefits.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Key Benefits:</h3>
              <div className="space-y-1">
                {card.benefits.slice(0, 3).map((benefit, index) => (
                  <div key={index} className={`text-xs text-gray-600 dark:text-gray-400 ${matchedFields?.includes('benefit') || matchedFields?.includes('category') ? 'bg-yellow-200 dark:bg-yellow-800 px-1 rounded' : ''}`}>
                    • {benefit.description} {benefit.maxAmount && `($${benefit.maxAmount})`}
                  </div>
                ))}
                {card.benefits.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    +{card.benefits.length - 3} more benefits
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- Add Last 4 Digits Field --- */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-100">
              Last 4 Digits (Optional)
            </label>
            <input
              type="text"
              id={`lastFourDigits-${card.id}`}
              name="lastFourDigits"
              maxLength={4}
              pattern="[0-9]{4}"
              placeholder="1234"
              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 dark:placeholder-gray-400"
              onInput={(e) => {
                // Only allow numbers
                const target = e.target as HTMLInputElement;
                target.value = target.value.replace(/[^0-9]/g, '');
              }}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Helps identify your specific card if you have multiple of the same type
            </p>
          </div>
          {/* --- End Last 4 Digits Field --- */}

          {/* --- Add Opened Month and Year Select --- */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-100">
              Date Card Opened (Optional)
            </label>
            <div className="flex space-x-2">
              {/* Month Select */}
              <select
                id={`openedMonth-${card.id}`}
                name="openedMonth"
                className="mt-1 block w-1/2 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
                defaultValue=""
              >
                <option value="" disabled>Month...</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
              {/* Year Select */}
              <select
                id={`openedYear-${card.id}`}
                name="openedYear"
                className="mt-1 block w-1/2 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
                defaultValue=""
              >
                <option value="" disabled>Year...</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Helps track annual fees/benefits. Check your credit report (
              <a href="https://www.creditkarma.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">Credit Karma</a>,
              <a href="https://www.experian.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">Experian</a>, etc.)
               if unsure.
            </p>
          </div>
          {/* --- End Opened Month and Year Select --- */}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className={`mt-auto w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isPending ? 'Adding...' : 'Add Card'}
        </button>
      </div>
    </form>
  );
}

// --- Page Component --- 
export default function AddNewCardPage() {
  // State for cards and search term
  const [predefinedCards, setPredefinedCards] = useState<CardWithBenefits[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Loading state for fetching predefined cards
  const [groupByIssuer, setGroupByIssuer] = useState(true); // Toggle for grouping by issuer


  // Fetch data using useEffect
  useEffect(() => {
    async function fetchCards() {
      try {
        const response = await fetch('/api/predefined-cards-with-benefits');
        if (!response.ok) {
          throw new Error('Failed to fetch cards');
        }
        const data: CardWithBenefits[] = await response.json();
        setPredefinedCards(data);
      } catch (error) {
        console.error("Error fetching predefined cards:", error);
        // Handle error state if needed (e.g., show error message)
      } finally {
        setIsLoading(false); // Set loading to false after fetch (success or error)
      }
    }

    fetchCards();
  }, []); // Empty dependency array means this runs once on mount

  // Enhanced search logic
  const searchResults = searchCards(predefinedCards, searchTerm);
  const filteredCards = searchResults.map(result => result.card);

  // Group cards by issuer if groupByIssuer is true
  const groupedCards = React.useMemo(() => {
    if (!groupByIssuer) return { 'All Cards': filteredCards };
    
    const grouped = filteredCards.reduce((acc, card) => {
      const issuer = card.issuer;
      if (!acc[issuer]) {
        acc[issuer] = [];
      }
      acc[issuer].push(card);
      return acc;
    }, {} as Record<string, CardWithBenefits[]>);

    // Sort issuers alphabetically
    const sortedGrouped = Object.keys(grouped)
      .sort()
      .reduce((acc, issuer) => {
        acc[issuer] = grouped[issuer];
        return acc;
      }, {} as Record<string, CardWithBenefits[]>);

    return sortedGrouped;
  }, [filteredCards, groupByIssuer]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Select a Card to Add</h1>
      
      {/* Search and Toggle Controls */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <input 
            type="text"
            placeholder="Search by card name, issuer, benefits, or try 'amex', 'travel', 'dining', 'uber'..."
            className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
                 {/* Show search results count */}
         {searchTerm && (
           <div className="text-sm text-gray-600 dark:text-gray-400">
             Found {filteredCards.length} card{filteredCards.length !== 1 ? 's' : ''} matching &ldquo;{searchTerm}&rdquo;
           </div>
         )}
         
         {/* Quick search examples */}
         {!searchTerm && (
           <div className="flex flex-wrap gap-2 text-sm">
             <span className="text-gray-500 dark:text-gray-400">Try searching:</span>
             {['amex', 'travel', 'dining', 'uber', 'business'].map(example => (
               <button
                 key={example}
                 onClick={() => setSearchTerm(example)}
                 className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
               >
                 {example}
               </button>
             ))}
           </div>
         )}
        
        {/* Toggle for grouping by issuer */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="groupByIssuer"
            checked={groupByIssuer}
            onChange={(e) => setGroupByIssuer(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="groupByIssuer" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Group by Issuing Bank
          </label>
        </div>
      </div>

      {isLoading ? (
         <p className="dark:text-gray-400">Loading cards...</p> // Basic loading indicator
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedCards).map(([issuer, cards]) => (
            <div key={issuer} className="space-y-4">
              {/* Issuer Header - only show if grouping and not 'All Cards' */}
              {groupByIssuer && issuer !== 'All Cards' && (
                <div className="border-b-2 border-gray-200 dark:border-gray-700 pb-2">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium mr-3">
                      {cards.length} card{cards.length !== 1 ? 's' : ''}
                    </span>
                    {issuer}
                  </h2>
                </div>
              )}
              
              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card) => {
                  const matchedFields = searchResults.find(result => result.card.id === card.id)?.matchedFields || [];
                  return (
                    <PredefinedCardForm key={card.id} card={card} matchedFields={matchedFields} />
                  );
                })}
              </div>
            </div>
          ))}
          
          {/* No results message */}
          {Object.keys(groupedCards).length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No cards found matching your search criteria.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
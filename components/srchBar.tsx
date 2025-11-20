import React, {useEffect, useState} from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { textStyles } from '../styles/textStyles';
import { quickSearchItem } from '../interfaces';

const SearchBar = 
({setQuickSearchResults, setIsShowingAllResults, setShowLoadingIndicator, onFetchNextBatch} : 
 {setQuickSearchResults: React.Dispatch<React.SetStateAction<quickSearchItem[]>>, setIsShowingAllResults: React.Dispatch<React.SetStateAction<boolean>>, setShowLoadingIndicator: React.Dispatch<React.SetStateAction<boolean>>, onFetchNextBatch?: (fetchFunction: () => Promise<boolean>) => void}) => {
  
  const dom = (globalThis as any).dom;

  const [query, setQuery] = useState('');
  const [maxPages, setMaxPages] = useState<number>(1);
  const [currPage, setCurrPage] = useState<number>(1);

  const updateQuickSearchResults = async (query: string) => {
    try {
      const response = await fetch(`https://${dom}/wp-admin/admin-ajax.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          action: "ts_ac_do_search",
          ts_ac_query: query
        }).toString()
      });
      
      const data = await response.text();
      const {anime} = JSON.parse(data);
      const searchList = anime[0].all as quickSearchItem[];
      setQuickSearchResults(searchList);
    } catch (error) {
      console.error("Error:", error);
    }
  }; 

  const getSearchItemsFromSrchPage = async (url: string): Promise<quickSearchItem[]> => {
    try {
      const response = await fetch(url);
      const htmlData = await response.text();
      
      const regex = /<article\s+class="bs"[^>]*>[\s\S]*?<\/article>/gi;
      const matches = htmlData.match(regex);

      const a_regex = /href=["']([^"']+)["']/i;
      const type_regex = /<div\s+class="typez[^"]*"[^>]*>([\s\S]*?)<\/div>/i;
      const epx_regex = /<span\s+class="epx"[^>]*>([\s\S]*?)<\/span>/i; 
      const img_regex = /src=["']([^"']+)["']/i;
      const title_regex = /title=["']([^"']+)["']/i;

      if (matches) {
        const searchList: quickSearchItem[] = matches.map(match => {
          const linkMatch = a_regex.exec(match);
          const typeMatch = type_regex.exec(match);
          const epxMatch = epx_regex.exec(match);
          const imgMatch = img_regex.exec(match);
          const titleMatch = title_regex.exec(match);

          return {
            post_link: linkMatch ? linkMatch[1] : '',
            ID: -1,
            post_ep: epxMatch ? epxMatch[1] : '',
            post_genres: '',
            post_image: imgMatch ? imgMatch[1] : '',
            post_title: titleMatch ? titleMatch[1] : '',
            post_type: typeMatch ? typeMatch[1] : '',
            post_image_html: '',
            post_latest: '',
            post_sub: ''
          };
        });
        return searchList;
      }
      return [];
    } catch (error) {
      console.error("Error fetching search page:", error);
      return [];
    }
  }

  const fetchNextBatch = async () : Promise<boolean> => {
    const nextPage = currPage + 1;
    if (nextPage > maxPages) {
      console.log("No more pages to fetch.");
      return false;
    }

    const url = `https://${dom}/page/${nextPage}/?s=${query}`;
    const searchItems = await getSearchItemsFromSrchPage(url);
    setQuickSearchResults(prevResults => [...prevResults, ...searchItems]);
    setCurrPage(nextPage);
    return true;
  }

  // Pass fetchNextBatch function to parent component
  useEffect(() => {
    if (onFetchNextBatch) {
      onFetchNextBatch(fetchNextBatch);
    }
  }, [query, currPage, maxPages]);

    const fetchFirstBatch = async () => {
      try {
        const firstPageUrl = `https://${dom}/?s=${query}`;
        const response = await fetch(firstPageUrl);
        const htmlData = await response.text();

        // Get search items from first page using the function
        const firstPageItems = await getSearchItemsFromSrchPage(firstPageUrl);
        setQuickSearchResults(firstPageItems);


        // Check for pagination
        const pagination_regex = /<div\s+class="pagination"[^>]*>([\s\S]*?)<\/div>/i;
        const paginationMatch = pagination_regex.exec(htmlData);

        const page_numbers_regex = /<a\s+class="page-numbers"[^>]*>([\s\S]*?)<\/a>/gi;
        if (paginationMatch) {
          const paginationContent = paginationMatch[1];
          const pageNumberMatches = [...paginationContent.matchAll(page_numbers_regex)];
          const pageNumbers = pageNumberMatches.map(match => match[1]);
          
          if (pageNumbers.length > 0) {
            const maxPageNumber = Math.max(...pageNumbers.map(Number));
            setMaxPages(maxPageNumber);
          } else {
            console.log("No page numbers found.");
          }
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };


  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          value={query}
          onChangeText={async (text) => {
            setQuery(text);
            setShowLoadingIndicator(true);
            await updateQuickSearchResults(text);
            setIsShowingAllResults(false);
            setShowLoadingIndicator(false);
          }}
          onSubmitEditing={async () => {
            console.log('pressed');
            setIsShowingAllResults(true);
            setMaxPages(1);
            setCurrPage(1);
            setShowLoadingIndicator(true);
            await fetchFirstBatch();
            setShowLoadingIndicator(false);
          }}
          placeholder="Search"
          placeholderTextColor="rgba(224, 242, 254, 0.5)"
          style={[styles.searchInput, textStyles.neonGlow]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 4
  },
  searchBar: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(92, 153, 246, 0.65)',
    backgroundColor: 'rgba(148, 163, 184, 0.14)',
    paddingHorizontal: 18,
    paddingVertical: 0,
    shadowColor: '#6389f1ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 18
  },
  searchInput: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SearchBar;
'use strict';

const SPARQL_RESIDENCE_QUERY = `
SELECT ?location ?locationLabel ?pointInTime ?ptPrecision (SAMPLE(?coord_raw) AS ?coord) (SAMPLE(?image_raw) AS ?image) WHERE {

  wd:Q561682 p:P551 ?residenceStatement .
  ?residenceStatement ps:P551 ?location .
  
  ?residenceStatement pqv:P585 ?ptNode .
  ?ptNode wikibase:timeValue ?pointInTime ;
          wikibase:timePrecision ?ptPrecision .
          
  OPTIONAL { ?location wdt:P625 ?coord_raw . }
  
  OPTIONAL { ?location wdt:P18 ?image_raw . }
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "id,en". }
}
GROUP BY ?location ?locationLabel ?pointInTime ?ptPrecision
ORDER BY ?pointInTime
`;

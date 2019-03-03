library('tidyverse')
library('jsonlite')

read_concentration_data <- function(filename) {
    # Add a column full of NA if the column doesn't already exist
    default_col <- function(df, cols) {
        to_add <- cols[!cols %in% names(df)]
        if (length(to_add) > 0) {
            df[to_add] <- NA
        }

        df
    }

    df <- read_csv(filename)
    df <- default_col(df, c('OPTAX.id', 'OPTAX.display-label'))
    df <- df %>%
          select(NAICS.id,
                 'NAICS.display-label',
                 CONCENFI.id,
                 'CONCENFI.display-label',
                 OPTAX.id,
                 'OPTAX.display-label',
                 RCPTOT,
                 VAL_PCT,
                 EMP,
                 PAYANN,
                 ESTAB,
                 YEAR.id) %>%
          rename('NAICS.label' = 'NAICS.display-label',
                 'CONCENFI.label' = 'CONCENFI.display-label',
                 'OPTAX.label' = 'OPTAX.display-label',
                 YEAR = YEAR.id) %>%
          mutate(NAICS.id = as.character(NAICS.id),
                 NAICS.label = as.factor(NAICS.label),
                 SECTOR.id = as.factor(substr(NAICS.id, 0, 2)),
                 VAL_PCT = as.double(VAL_PCT),
                 EMP = as.double(EMP),
                 RCPTOT = as.double(RCPTOT),
                 YEAR = as.integer(YEAR))

    # Ignore rows that are specific to certain tax statuses
    df <- filter(df, is.na(OPTAX.id) | OPTAX.id == 'A' | OPTAX.id == '00')

    # Add sector labels
    sectors <- df %>%
               filter(nchar(NAICS.id) == 2) %>%
               select(NAICS.id, NAICS.label, CONCENFI.id) %>%
               rename(SECTOR.id = NAICS.id,
                      SECTOR.label = NAICS.label)
    df <- inner_join(df, sectors, by = c('SECTOR.id', 'CONCENFI.id'))

    df
}

read_all_concentration_data <- function(dir = ".", pattern = NULL) {
    files = list.files(dir, pattern)
    df <- NULL
    for (file in files) {
        path <- paste(dir, file, sep='/')
        df <- rbind(df, read_concentration_data(path))
    }
    df
}

# Shape each dataframe down to what we need
shape <- function(df) {
    df <- df %>%
          filter(nchar(NAICS.id) == 4) %>%      # Only look at industry groups
          filter(!is.na(VAL_PCT))

    df <- df %>%
          select(NAICS.id, NAICS.label, CONCENFI.id,
                 SECTOR.label, RCPTOT, VAL_PCT) %>%
          filter(CONCENFI.id == '804')  %>%     # Only look at top four
          select(-CONCENFI.id)
}

df.1997 <- read_csv('concentration-data/1997/industry-groups.csv') %>%
           filter(!is.na(VAL_PCT)) %>%
           mutate(NAICS.id = as.character(NAICS.id))

df.2002 <- read_all_concentration_data('concentration-data/2002', '*Z6.csv')
df.2007 <- read_all_concentration_data('concentration-data/2007', '*Z6.csv')
df.2012 <- read_all_concentration_data('concentration-data/2012', '*Z6.csv')

df.2002 <- shape(df.2002)
df.2007 <- shape(df.2007)
df.2012 <- shape(df.2012)

df <- inner_join(df.2002,
                 df.2007,
                 by=c('NAICS.id', 'NAICS.label', 'SECTOR.label'),
                 suffix=c('.2002', '.2007'))
df <- inner_join(df,
                 df.2012,
                 by=c('NAICS.id', 'NAICS.label', 'SECTOR.label')) %>%
      rename(VAL_PCT.2012 = VAL_PCT,
             RCPTOT.2012 = RCPTOT)

df <- inner_join(df,
                 df.1997,
                 by=c('NAICS.id', 'NAICS.label')) %>%
      rename(VAL_PCT.1997 = VAL_PCT,
             RCPTOT.1997 = RCPTOT)

json <- toJSON(df, pretty=TRUE)
write(json, 'dist/data.json')

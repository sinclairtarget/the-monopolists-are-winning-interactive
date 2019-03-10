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

industries <- function(df) {
    df.industries <- df %>%
        filter(nchar(NAICS.id) == 6) %>%      # Only look at industries
        filter(!is.na(VAL_PCT)) %>%
        filter(CONCENFI.id == '804')  %>%     # Only look at top four
        select(NAICS.id, NAICS.label, SECTOR.id, SECTOR.label, VAL_PCT)

    # Join with rcptot for all firms
    df.rcptot <- df %>%
        filter(nchar(NAICS.id) == 6) %>%      # Only look at industries
        filter(CONCENFI.id == '001')  %>%     # Only look at all firms
        select(NAICS.id, RCPTOT) %>%
        rename(RCPTOT_ALL_FIRMS = RCPTOT)

    inner_join(df.industries, df.rcptot, by=c('NAICS.id'))
}

sectors <- function(df) {
    df.sectors <- df %>%
        filter(nchar(NAICS.id) == 2) %>%      # Only look at sectors
        filter(CONCENFI.id == '001')  %>%     # Only look at all firms
        select(SECTOR.id, SECTOR.label, RCPTOT) %>%
        rename(RCPTOT_ALL_FIRMS = RCPTOT)

    # Calculate mean VAL_PCT of sector industries
    df.means <- df %>%
                industries() %>%
                group_by(SECTOR.id, SECTOR.label) %>%
                summarize(MEAN_VAL_PCT = mean(VAL_PCT))

    inner_join(df.sectors, df.means, by=c('SECTOR.id', 'SECTOR.label'))
}

#df.1997 <- read_csv('concentration-data/1997/industry-groups.csv') %>%
#           filter(!is.na(VAL_PCT)) %>%
#           mutate(NAICS.id = as.character(NAICS.id))

df.raw.2002 <- read_all_concentration_data('concentration-data/2002', '*Z6.csv')
df.raw.2007 <- read_all_concentration_data('concentration-data/2007', '*Z6.csv')
df.raw.2012 <- read_all_concentration_data('concentration-data/2012', '*Z6.csv')

df.2002 <- industries(df.raw.2002)
df.2007 <- industries(df.raw.2007)
df.2012 <- industries(df.raw.2012)

df.sectors.2002 <- sectors(df.raw.2002)
df.sectors.2007 <- sectors(df.raw.2007)
df.sectors.2012 <- sectors(df.raw.2012)

df <- inner_join(df.2002,
                 df.2007,
                 by=c('NAICS.id', 'NAICS.label', 'SECTOR.id', 'SECTOR.label'),
                 suffix=c('.2002', '.2007'))
df <- inner_join(df,
                 df.2012,
                 by=c('NAICS.id', 'NAICS.label', 'SECTOR.id', 'SECTOR.label')) %>%
      rename(VAL_PCT.2012 = VAL_PCT,
             RCPTOT_ALL_FIRMS.2012 = RCPTOT_ALL_FIRMS)

df.sectors <- inner_join(df.sectors.2002,
                         df.sectors.2007,
                         by=c('SECTOR.id', 'SECTOR.label'),
                         suffix=c('.2002', '.2007'))
df.sectors <- inner_join(df.sectors,
                         df.sectors.2012,
                         by=c('SECTOR.id', 'SECTOR.label')) %>%
              rename(MEAN_VAL_PCT.2012 = MEAN_VAL_PCT,
                     RCPTOT_ALL_FIRMS.2012 = RCPTOT_ALL_FIRMS)

json <- toJSON(df, pretty=TRUE)
write(json, 'industries.json')

json <- toJSON(df.sectors, pretty=TRUE)
write(json, 'sectors.json')

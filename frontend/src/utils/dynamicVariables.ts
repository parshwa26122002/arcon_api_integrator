import { faker } from '@faker-js/faker';

type DynamicVariableFunction = (config?: VariableConfig) => string;

interface VariableConfig {
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  exactLength?: number;
  allowUnderscore?: boolean;
  // Password specific configs
  minSpecialChars?: number;
  maxSpecialChars?: number;
  minNumbers?: number;
  maxNumbers?: number;
}

interface VariableConfigurations {
  [key: string]: VariableConfig;
}

let variableConfigurations: VariableConfigurations = {};

export const setVariableConfigurations = (configs: VariableConfigurations) => {
  variableConfigurations = configs;
};

const generateLengthRestrictedName = (
  generateFunc: () => string,
  config?: VariableConfig
): string => {
  if (!config?.minLength && !config?.maxLength) {
    return generateFunc();
  }

  const minLength = config.minLength || 1;
  const maxLength = config.maxLength || 100;
  
  let result: string;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    result = generateFunc();
    attempts++;
    if (attempts >= maxAttempts) {
      console.warn(`Could not generate name within length restrictions after ${maxAttempts} attempts`);
      return result.slice(0, maxLength);
    }
  } while (result.length < minLength || result.length > maxLength);

  return result;
};

const generateNumberInRange = (
  min: number,
  max: number,
  isFloat: boolean = false
): number => {
  if (min > max) {
    [min, max] = [max, min]; // Swap if min > max
  }
  
  if (isFloat) {
    return faker.number.float({ min, max });
  }
  return faker.number.int({ min, max });
};

const generatePriceInRange = (min: number, max: number): string => {
  const price = generateNumberInRange(min, max, true);
  return price.toFixed(2); // Format with 2 decimal places
};

const generateUsername = (config?: VariableConfig): string => {
  const minLength = config?.minLength || 5;
  const maxLength = config?.maxLength || 15;
  const allowUnderscore = config?.allowUnderscore ?? true;

  const patterns = [
    // firstName + random number
    () => `${faker.person.firstName().toLowerCase()}${faker.number.int({ min: 1, max: 999 })}`,
    
    // firstName + lastName (with optional underscore)
    () => {
      const firstName = faker.person.firstName().toLowerCase();
      const lastName = faker.person.lastName().toLowerCase();
      return allowUnderscore ? 
        `${firstName}_${lastName}` : 
        `${firstName}${lastName}`;
    },
    
    // firstName initial + lastName + random number
    () => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName().toLowerCase();
      return `${firstName[0].toLowerCase()}${lastName}${faker.number.int({ min: 1, max: 99 })}`;
    },
    
    // random word + random number
    () => `${faker.word.sample().toLowerCase()}${faker.number.int({ min: 1, max: 999 })}`,
    
    // two random words (with optional underscore)
    () => {
      const word1 = faker.word.sample().toLowerCase();
      const word2 = faker.word.sample().toLowerCase();
      return allowUnderscore ? 
        `${word1}_${word2}` : 
        `${word1}${word2}`;
    }
  ];

  // Keep generating until we get a username within the length constraints
  let attempts = 0;
  const maxAttempts = 100;
  let username: string;

  do {
    // Randomly select a pattern
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
    username = randomPattern();
    attempts++;

    if (attempts >= maxAttempts) {
      console.warn(`Could not generate username within length restrictions after ${maxAttempts} attempts`);
      // Truncate or pad the username to fit within constraints
      if (username.length > maxLength) {
        username = username.slice(0, maxLength);
      } else if (username.length < minLength) {
        while (username.length < minLength) {
          username += faker.number.int({ min: 0, max: 9 }).toString();
        }
      }
      break;
    }
  } while (username.length < minLength || username.length > maxLength);

  return username;
};

const generateExactLengthNumber = (length: number): string => {
  if (length <= 0) return '';
  
  // First digit shouldn't be 0
  let result = faker.number.int({ min: 1, max: 9 }).toString();
  
  // Add remaining random digits
  for (let i = 1; i < length; i++) {
    result += faker.number.int({ min: 0, max: 9 }).toString();
  }
  
  return result;
};

const generatePassword = (config?: VariableConfig): string => {
  const minLength = config?.minLength || 8;
  const maxLength = config?.maxLength || 16;
  const minSpecialChars = config?.minSpecialChars || 1;
  const maxSpecialChars = config?.maxSpecialChars || 3;
  const minNumbers = config?.minNumbers || 1;
  const maxNumbers = config?.maxNumbers || 3;

  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const numbers = '0123456789';
  const lowerLetters = 'abcdefghijklmnopqrstuvwxyz';
  const upperLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // Helper function to get random chars from a string
  const getRandomChars = (source: string, min: number, max: number): string[] => {
    const count = faker.number.int({ min, max });
    const chars: string[] = [];
    for (let i = 0; i < count; i++) {
      chars.push(source[faker.number.int({ min: 0, max: source.length - 1 })]);
    }
    return chars;
  };

  // Get required characters
  const specialCharList = getRandomChars(specialChars, minSpecialChars, maxSpecialChars);
  const numbersList = getRandomChars(numbers, minNumbers, maxNumbers);

  // Calculate remaining length for letters
  const usedLength = specialCharList.length + numbersList.length;
  const remainingLength = faker.number.int({
    min: Math.max(minLength - usedLength, 0),
    max: Math.max(maxLength - usedLength, 0)
  });

  // Get letters (mix of upper and lower case)
  const lettersList: string[] = [];
  for (let i = 0; i < remainingLength; i++) {
    const useUpper = faker.datatype.boolean();
    const source = useUpper ? upperLetters : lowerLetters;
    lettersList.push(source[faker.number.int({ min: 0, max: source.length - 1 })]);
  }

  // Combine all characters
  const allChars = [...specialCharList, ...numbersList, ...lettersList];

  // Shuffle the array
  for (let i = allChars.length - 1; i > 0; i--) {
    const j = faker.number.int({ min: 0, max: i });
    [allChars[i], allChars[j]] = [allChars[j], allChars[i]];
  }

  // If the password is too long, trim it
  if (allChars.length > maxLength) {
    allChars.length = maxLength;
  }

  // If the password is too short, add random letters
  while (allChars.length < minLength) {
    const useUpper = faker.datatype.boolean();
    const source = useUpper ? upperLetters : lowerLetters;
    allChars.push(source[faker.number.int({ min: 0, max: source.length - 1 })]);
  }

  return allChars.join('');
};

const dynamicVariables: Record<string, DynamicVariableFunction> = {
  // Names with length restrictions
  $randomFirstName: (config?: VariableConfig) => 
    generateLengthRestrictedName(() => faker.person.firstName(), config || variableConfigurations['$randomFirstName']),
  
  $randomLastName: (config?: VariableConfig) => 
    generateLengthRestrictedName(() => faker.person.lastName(), config || variableConfigurations['$randomLastName']),
  
  $randomFullName: (config?: VariableConfig) => 
    generateLengthRestrictedName(() => faker.person.fullName(), config || variableConfigurations['$randomFullName']),
  
  $randomJobTitle: (config?: VariableConfig) => 
    generateLengthRestrictedName(() => faker.person.jobTitle(), config || variableConfigurations['$randomJobTitle']),
  
  // Names
  $randomNamePrefix: () => faker.person.prefix(),
  $randomNameSuffix: () => faker.person.suffix(),
  
  // Internet & Tech
  $randomEmail: () => faker.internet.email(),
  $randomUserName: (config?: VariableConfig) => {
    const config_ = config || variableConfigurations['$randomUserName'];
    return generateUsername(config_);
  },
  $randomDomainName: () => faker.internet.domainName(),
  $randomUrl: () => faker.internet.url(),
  $randomIp: () => faker.internet.ip(),
  $randomIPv6: () => faker.internet.ipv6(),
  $randomPassword: (config?: VariableConfig) => {
    const config_ = config || variableConfigurations['$randomPassword'];
    return generatePassword(config_);
  },
  $randomMac: () => faker.internet.mac(),
  $randomUserAgent: () => faker.internet.userAgent(),
  $randomProtocol: () => faker.internet.protocol(),
  $randomHttpMethod: () => faker.internet.httpMethod(),
  
  // Location
  $randomCity: () => faker.location.city(),
  $randomCountry: () => faker.location.country(),
  $randomCountryCode: () => faker.location.countryCode(),
  $randomStreetAddress: (config?: VariableConfig) =>
    generateLengthRestrictedName(() => faker.location.streetAddress(), config || variableConfigurations['$randomStreetAddress']),
  $randomStreetName: (config?: VariableConfig) =>
    generateLengthRestrictedName(() => faker.location.street(), config || variableConfigurations['$randomStreetName']),
  $randomZipCode: () => faker.location.zipCode(),
  $randomLatitude: () => faker.location.latitude().toString(),
  $randomLongitude: () => faker.location.longitude().toString(),
  $randomTimeZone: () => faker.location.timeZone(),
  
  // Numbers
  $randomInt: (config?: VariableConfig) => {
    const config_ = config || variableConfigurations['$randomInt'];
    const min = config_?.minValue ?? 0;
    const max = config_?.maxValue ?? 100000;
    return generateNumberInRange(min, max).toString();
  },

  $randomFloat: (config?: VariableConfig) => {
    const config_ = config || variableConfigurations['$randomFloat'];
    const min = config_?.minValue ?? 0;
    const max = config_?.maxValue ?? 100000;
    return generateNumberInRange(min, max, true).toString();
  },

  $randomUuid: () => faker.string.uuid(),
  
  // Date & Time
  $randomDate: () => faker.date.recent().toISOString(),
  $randomFutureDate: () => faker.date.future().toISOString(),
  $randomPastDate: () => faker.date.past().toISOString(),
  $randomMonth: () => faker.date.month(),
  $randomWeekday: () => faker.date.weekday(),
  $timestamp: () => Date.now().toString(),
  $isoTimestamp: () => new Date().toISOString(),
  
  // Business
  $randomCompanyName: () => faker.company.name(),
  $randomBs: () => faker.company.buzzPhrase(),
  $randomCatchPhrase: () => faker.company.catchPhrase(),
  $randomDepartment: () => faker.commerce.department(),
  $randomProduct: () => faker.commerce.product(),
  $randomPrice: (config?: VariableConfig) => {
    const config_ = config || variableConfigurations['$randomPrice'];
    const min = config_?.minValue ?? 0;
    const max = config_?.maxValue ?? 1000;
    return generatePriceInRange(min, max);
  },
  
  // Colors
  $randomColor: () => faker.color.human(),
  $randomHex: () => faker.color.rgb({ format: 'hex' }),
  $randomRgb: () => faker.color.rgb(),
  
  // Text
  $randomWord: () => faker.word.sample(),
  $randomWords: () => faker.word.words(),
  $randomPhrase: () => faker.lorem.sentence(),
  $randomSentence: () => faker.lorem.sentence(),
  $randomParagraph: () => faker.lorem.paragraph(),
  
  // Files & Media
  $randomFileName: () => faker.system.fileName(),
  $randomFileExt: () => faker.system.fileExt(),
  $randomMimeType: () => faker.system.mimeType(),
  $randomImageUrl: () => faker.image.url(),
  
  // Finance
  $randomBankAccount: (config?: VariableConfig) => {
    const config_ = config || variableConfigurations['$randomBankAccount'];
    const length = config_?.exactLength || 10; // Default to 10 digits if not specified
    return generateExactLengthNumber(length);
  },
  $randomBankAccountName: () => faker.finance.accountName(),
  $randomCreditCard: () => faker.finance.creditCardNumber(),
  $randomCreditCardCVV: () => faker.finance.creditCardCVV(),
  $randomCurrency: () => faker.finance.currencyCode(),
  $randomBitcoin: () => faker.finance.bitcoinAddress(),
  
  // Misc
  $randomBoolean: () => faker.datatype.boolean().toString(),
  $randomAlpha: () => faker.string.alpha(),
  $randomAlphaNumeric: (config?: VariableConfig) => {
    const config_ = config || variableConfigurations['$randomAlphaNumeric'];
    const length = config_?.maxLength || 10;
    return faker.string.alphanumeric({ length });
  },

  $randomHexaDecimal: (config?: VariableConfig) => {
    const config_ = config || variableConfigurations['$randomHexaDecimal'];
    const length = config_?.maxLength || 10;
    return faker.string.hexadecimal({ length });
  },

  $randomAbbreviation: () => faker.string.alpha({ length: 3 }).toUpperCase()
};

export const replaceDynamicVariables = (text: string): string => {
    // Match all three formats: $var, {$var}, and {{$var}}
    return text.replace(/(?:\{\{)?(?:\{)?(\$[a-zA-Z]+)(?:\})?(?:\})?/g, (match, varName) => {
        const variableFunction = dynamicVariables[varName];
        if (variableFunction) {
            try {
                const config = variableConfigurations[varName];
                const value = variableFunction(config);
                // Return the value with the same wrapping as the original
                if (match.startsWith('{{')) {
                    return `${value}`;
                } else if (match.startsWith('{')) {
                    return `${value}`;
                }
                return value;
            } catch (error) {
                console.error(`Error generating value for ${varName}:`, error);
                return match;
            }
        }
        return match;
    });
};

// Export the list of available dynamic variables for documentation
export const getDynamicVariablesList = (): string[] => {
    return Object.keys(dynamicVariables);
  };
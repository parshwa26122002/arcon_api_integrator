import { faker } from '@faker-js/faker';

type DynamicVariableFunction = () => string;

const generateUsername = (): string => {
    const patterns = [
      // firstName + random number
      () => `${faker.person.firstName().toLowerCase()}${faker.number.int({ min: 1, max: 999 })}`,
      // firstName + lastName
      () => `${faker.person.firstName().toLowerCase()}_${faker.person.lastName().toLowerCase()}`,
      // firstName initial + lastName + random number
      () => {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        return `${firstName[0].toLowerCase()}${lastName.toLowerCase()}${faker.number.int({ min: 1, max: 99 })}`;
      },
      // random word + random number
      () => `${faker.word.sample().toLowerCase()}${faker.number.int({ min: 1, max: 999 })}`,
      // two random words
      () => `${faker.word.sample().toLowerCase()}_${faker.word.sample().toLowerCase()}`
    ];
  
    // Randomly select a pattern
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
    return randomPattern();
  };

const dynamicVariables: Record<string, DynamicVariableFunction> = {
  // Names
  $randomFirstName: () => faker.person.firstName(),
  $randomLastName: () => faker.person.lastName(),
  $randomFullName: () => faker.person.fullName(),
  $randomNamePrefix: () => faker.person.prefix(),
  $randomNameSuffix: () => faker.person.suffix(),
  $randomJobTitle: () => faker.person.jobTitle(),
  
  // Internet & Tech
  $randomEmail: () => faker.internet.email(),
  $randomUserName: generateUsername,
  $randomDomainName: () => faker.internet.domainName(),
  $randomUrl: () => faker.internet.url(),
  $randomIp: () => faker.internet.ip(),
  $randomIPv6: () => faker.internet.ipv6(),
  $randomPassword: () => faker.internet.password(),
  $randomMac: () => faker.internet.mac(),
  $randomUserAgent: () => faker.internet.userAgent(),
  $randomProtocol: () => faker.internet.protocol(),
  $randomHttpMethod: () => faker.internet.httpMethod(),
  
  // Location
  $randomCity: () => faker.location.city(),
  $randomCountry: () => faker.location.country(),
  $randomCountryCode: () => faker.location.countryCode(),
  $randomStreetAddress: () => faker.location.streetAddress(),
  $randomStreetName: () => faker.location.street(),
  $randomZipCode: () => faker.location.zipCode(),
  $randomLatitude: () => faker.location.latitude().toString(),
  $randomLongitude: () => faker.location.longitude().toString(),
  $randomTimeZone: () => faker.location.timeZone(),
  
  // Numbers
  $randomInt: () => faker.number.int({ min: 0, max: 100000 }).toString(),
  $randomFloat: () => faker.number.float({ min: 0, max: 100000 }).toString(),
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
  $randomPrice: () => faker.commerce.price(),
  
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
  $randomBankAccount: () => faker.finance.accountNumber(),
  $randomBankAccountName: () => faker.finance.accountName(),
  $randomCreditCard: () => faker.finance.creditCardNumber(),
  $randomCreditCardCVV: () => faker.finance.creditCardCVV(),
  $randomCurrency: () => faker.finance.currencyCode(),
  $randomBitcoin: () => faker.finance.bitcoinAddress(),
  
  // Misc
  $randomBoolean: () => faker.datatype.boolean().toString(),
  $randomAlpha: () => faker.string.alpha(),
  $randomAlphaNumeric: () => faker.string.alphanumeric(),
  $randomHexaDecimal: () => faker.string.hexadecimal(),
  $randomAbbreviation: () => faker.string.alpha({ length: 3 }).toUpperCase()
};

export const replaceDynamicVariables = (text: string): string => {
    // Match all three formats: $var, {$var}, and {{$var}}
    return text.replace(/(?:\{\{)?(?:\{)?(\$[a-zA-Z]+)(?:\})?(?:\})?/g, (match, varName) => {
        const variableFunction = dynamicVariables[varName];
        if (variableFunction) {
            try {
                const value = variableFunction();
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
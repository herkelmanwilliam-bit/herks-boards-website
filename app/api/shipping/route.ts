import { NextResponse } from 'next/server';

async function getUpsToken() {
  const clientId = process.env.UPS_CLIENT_ID;
  const clientSecret = process.env.UPS_CLIENT_SECRET;
  
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  const response = await fetch('https://onlinetools.ups.com/security/v1/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  
  if (!response.ok) {
    throw new Error('Failed to get UPS OAuth token');
  }
  
  const data = await response.json();
  return data.access_token;
}

export async function POST(req: Request) {
  try {
    const { zipCode, items } = await req.json();

    if (!zipCode) {
      return NextResponse.json({ error: 'ZIP code is required' }, { status: 400 });
    }

    const token = await getUpsToken();
    const upsAccount = process.env.UPS_ACCOUNT_NUMBER || '24H611';

    // Calculate total weight (rough estimate: assuming each item is 5 lbs if not specified)
    const totalWeight = items.reduce((acc: number, item: any) => acc + (item.quantity * 5), 0).toString();

    // The UPS Rating API "Shop" endpoint returns rates for all available services
    const rateRequest = {
      RateRequest: {
        Request: {
          TransactionReference: {
            CustomerContext: "HerksBoards Checkout"
          }
        },
        Shipment: {
          Shipper: {
            Name: "Herk's Boards",
            ShipperNumber: upsAccount,
            Address: {
              AddressLine: ["Iowa"], 
              City: "Iowa City", // Placeholder for their actual city
              StateProvinceCode: "IA",
              PostalCode: "52240",
              CountryCode: "US"
            }
          },
          ShipTo: {
            Name: "Customer",
            Address: {
              PostalCode: zipCode,
              CountryCode: "US"
            }
          },
          Package: {
            PackagingType: {
              Code: "02",
              Description: "Customer Supplied Package"
            },
            Dimensions: {
              UnitOfMeasurement: {
                Code: "IN"
              },
              Length: "18",
              Width: "12",
              Height: "4"
            },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: "LBS"
              },
              Weight: totalWeight || "5"
            }
          }
        }
      }
    };

    const response = await fetch('https://onlinetools.ups.com/api/rating/v1/Shop', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(rateRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('UPS API Error:', errorText);
      throw new Error('Failed to fetch rates from UPS');
    }

    const data = await response.json();
    
    // Map UPS service codes to readable names
    const serviceMap: Record<string, string> = {
      '03': 'UPS Ground',
      '02': 'UPS 2nd Day Air',
      '01': 'UPS Next Day Air',
      '12': 'UPS 3 Day Select',
      '13': 'UPS Next Day Air Saver',
      '14': 'UPS Next Day Air Early'
    };

    const options = data.RateResponse.Shipment.RatedShipment.map((shipment: any) => ({
      name: serviceMap[shipment.Service.Code] || `UPS Service ${shipment.Service.Code}`,
      price: parseFloat(shipment.TotalCharges.MonetaryValue)
    }));

    // Filter to just the most common options if needed, and sort by price
    const sortedOptions = options
      .filter((opt: any) => ['UPS Ground', 'UPS 2nd Day Air', 'UPS Next Day Air'].includes(opt.name))
      .sort((a: any, b: any) => a.price - b.price);

    return NextResponse.json({ options: sortedOptions });

  } catch (error) {
    console.error('Shipping calculation error:', error);
    return NextResponse.json({ error: 'Failed to calculate shipping' }, { status: 500 });
  }
}

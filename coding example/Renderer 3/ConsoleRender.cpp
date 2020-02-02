#include "ConsoleRender.h"
#include <iostream>

CR createCR(int w, int h)
{
	CR cr = (CR)malloc(sizeof(_CR));
	cr->w = w;
	cr->h = h;
	cr->p = (char*)malloc((cr->w * 2 + 5) * (cr->h + 2));

	char* q = cr->p;

	//Set top border
	memcpy(q, "©³", 2); q += 2;
	for (int i = 0; i < cr->w; ++i)
	{
		memcpy(q, "©¥", 2); q += 2;
	}
	memcpy(q, "©·", 2); q += 2;
	*q = '\n'; q += 1;

	//Set mid
	for (int i = 0; i < cr->h; ++i)
	{
		memcpy(q, "©§", 2); q += 2 + cr->w * 2;
		memcpy(q, "©§", 2); q += 2;
		*q = '\n'; q += 1;
	}

	//Set bottom border
	memcpy(q, "©»", 2); q += 2;
	for (int i = 0; i < cr->w; ++i)
	{
		memcpy(q, "©¥", 2); q += 2;
	}
	memcpy(q, "©¿", 2); q += 2;
	*q = 0; //string terminator

	//clear
	clearCR(cr);

	return cr;
}

void clearCR(CR cr)
{
	char* q = cr->p + (cr->w * 2 + 5) + 2;
	for (int i = 0; i < cr->h; ++i)
	{
		for (int j = 0; j < cr->w * 2; ++j)
			q[j] = ' ';
		q += cr->w * 2 + 5;
	}
}

bool setCR(CR cr, int x, int y, char* s)
{
	if (x < 0 || x >= cr->w || y < 0 || y >= cr->h || !s)
		return false;

	if (strlen(s) > (cr->w - x) * 2)
		return false;

	char* q = cr->p + (cr->w * 2 + 5) + 2;

	memcpy(q + y * (cr->w * 2 + 5) + x * 2, s, strlen(s));

	return 1;
}

void renderCR(CR cr)
{
	std::cout<<cr->p;
}

void destroyCR(CR cr)
{
	free(cr->p);
	free(cr);
}